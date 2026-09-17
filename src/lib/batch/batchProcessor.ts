import { prisma } from "../db";
import { generateSpeech } from "../generation/ttsProvider";
import { composeVideo } from "../render/videoCompositor";
import { dispatchWebhookEvent } from "../webhooks/dispatcher";

export interface ParsedCsvRow {
  [key: string]: string;
}

// 1. CSV Parser
export function parseCsvText(csvText: string): { headers: string[]; rows: ParsedCsvRow[] } {
  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) {
    return { headers: [], rows: [] };
  }

  // Parse header line
  const headers = parseCsvLine(lines[0]);
  const rows: ParsedCsvRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    if (values.length === 0) continue;

    const rowObj: ParsedCsvRow = {};
    headers.forEach((header, index) => {
      rowObj[header.trim()] = (values[index] || "").trim();
    });
    rows.push(rowObj);
  }

  return { headers, rows };
}

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  values.push(current.trim());
  return values;
}

// 2. Extract variable tokens from template text
export function extractTemplateVariables(text: string): string[] {
  const matches = text.match(/\{\{([a-zA-Z0-9_-]+)\}\}/g);
  if (!matches) return [];
  const vars = matches.map((m) => m.replace(/[\{\}]/g, "").trim());
  return Array.from(new Set(vars));
}

// 3. Replace variables in string
export function replaceVariables(text: string, variables: Record<string, string>): string {
  let result = text;
  for (const [key, val] of Object.entries(variables)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, "gi");
    result = result.replace(regex, val);
  }
  return result;
}

// 4. Asynchronous Batch Pipeline Processor
export async function runBatchPipeline(batchJobId: string): Promise<void> {
  try {
    const batchJob = await prisma.batchJob.findUnique({
      where: { id: batchJobId },
      include: {
        items: true,
        workspace: true,
      },
    });

    if (!batchJob) return;

    await prisma.batchJob.update({
      where: { id: batchJobId },
      data: { status: "processing" },
    });

    // Fetch template project if specified, or use standard scenes
    let templateProject: any = null;
    if (batchJob.templateProjectId) {
      templateProject = await prisma.project.findUnique({
        where: { id: batchJob.templateProjectId },
        include: {
          scenes: {
            orderBy: { orderIndex: "asc" },
          },
        },
      });
    }

    let completedCount = 0;
    let failedCount = 0;
    let totalCreditsUsed = 0;

    for (const item of batchJob.items) {
      try {
        await prisma.batchItem.update({
          where: { id: item.id },
          data: { status: "rendering" },
        });

        let variables: Record<string, string> = {};
        try {
          variables = JSON.parse(item.variablesJson);
        } catch {
          variables = {};
        }

        // Build personalized scene data
        let script = "Hello {{name}}, welcome to your personalized preview from {{company}}.";
        let avatarUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&q=80";
        let background = "#0c111e";
        let orientation: "landscape" | "portrait" = "landscape";

        if (templateProject && templateProject.scenes && templateProject.scenes.length > 0) {
          const firstScene = templateProject.scenes[0];
          script = firstScene.scriptText || script;
          if (firstScene.avatarId) {
            const avatarRecord = await prisma.avatar.findUnique({
              where: { id: firstScene.avatarId },
            });
            if (avatarRecord?.thumbnailUrl) {
              avatarUrl = avatarRecord.thumbnailUrl;
            }
          }
          if (firstScene.backgroundValue) {
            background = firstScene.backgroundValue;
          }
          orientation = (templateProject.orientation as any) || "landscape";
        }

        const personalizedScript = replaceVariables(script, variables);

        // Generate TTS for row
        const tts = await generateSpeech(personalizedScript);

        // Render Video via Compositor
        const videoUrl = await composeVideo({
          projectId: `batch_${item.id.slice(0, 8)}`,
          projectName: `Batch Video ${item.rowIndex + 1}`,
          orientation,
          scenes: [
            {
              orderIndex: 0,
              scriptText: personalizedScript,
              avatarThumbnailUrl: avatarUrl,
              audioUrl: tts.audioUrl,
              durationSeconds: tts.audioDurationSeconds,
              backgroundValue: background,
              captionsEnabled: true,
            },
          ],
        });

        // Update item status
        await prisma.batchItem.update({
          where: { id: item.id },
          data: {
            status: "completed",
            outputVideoUrl: videoUrl,
          },
        });

        completedCount++;
        totalCreditsUsed += 10;
      } catch (itemErr: any) {
        console.error(`Error rendering batch item ${item.id}:`, itemErr);
        await prisma.batchItem.update({
          where: { id: item.id },
          data: {
            status: "failed",
            errorMessage: itemErr?.message || "Failed to render personalized video",
          },
        });
        failedCount++;
      }
    }

    // Deduct credits from workspace ledger
    await prisma.$transaction(async (tx) => {
      const latest = await tx.creditLedger.findFirst({
        where: { workspaceId: batchJob.workspaceId },
        orderBy: { createdAt: "desc" },
      });
      const balance = latest ? latest.balanceAfter : 100;
      const balanceAfter = Math.max(0, balance - totalCreditsUsed);

      await tx.creditLedger.create({
        data: {
          workspaceId: batchJob.workspaceId,
          delta: -totalCreditsUsed,
          reason: "consume",
          relatedEntityType: "batch",
          relatedEntityId: batchJob.id,
          balanceAfter,
        },
      });

      await tx.batchJob.update({
        where: { id: batchJobId },
        data: {
          status: failedCount === batchJob.items.length ? "failed" : "completed",
          completedCount,
          failedCount,
          creditsConsumed: totalCreditsUsed,
        },
      });
    });

    // Dispatch webhook
    dispatchWebhookEvent(batchJob.workspaceId, "batch.completed", {
      id: batchJob.id,
      name: batchJob.name,
      totalCount: batchJob.totalCount,
      completedCount,
      failedCount,
      creditsConsumed: totalCreditsUsed,
    }).catch(() => {});
  } catch (err) {
    console.error("Batch processor failed:", err);
    await prisma.batchJob.update({
      where: { id: batchJobId },
      data: { status: "failed" },
    });
  }
}
