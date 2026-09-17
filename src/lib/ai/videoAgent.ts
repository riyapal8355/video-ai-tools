import { prisma } from "../db";

export interface VideoAgentOptions {
  prompt: string;
  durationSeconds?: number;
  aspectRatio?: "16:9" | "9:16";
  preferredAvatarId?: string;
  preferredVoiceId?: string;
  tone?: string;
}

export interface AgentScenePlan {
  orderIndex: number;
  title: string;
  scriptText: string;
  headlineText?: string;
  subtitleText?: string;
  durationSeconds: number;
  avatarId: string;
  voiceId: string;
  backgroundValue: string;
  captionsEnabled: boolean;
}

export interface AgentVideoPlan {
  projectName: string;
  orientation: "landscape" | "portrait";
  recommendedAvatarId: string;
  recommendedVoiceId: string;
  scenes: AgentScenePlan[];
  estimatedCredits: number;
}

export async function generateAgentVideoPlan(
  options: VideoAgentOptions,
  workspaceId: string
): Promise<AgentVideoPlan> {
  const { prompt, durationSeconds = 30, aspectRatio = "16:9", tone = "Professional" } = options;

  // Retrieve workspace avatars & voices to pick from
  const stockAvatars = await prisma.avatar.findMany();
  const stockVoices = await prisma.voice.findMany();

  // 1. Resolve Chosen Avatar
  let chosenAvatarRecord = options.preferredAvatarId
    ? stockAvatars.find((a) => a.id === options.preferredAvatarId)
    : undefined;

  if (!chosenAvatarRecord && options.preferredAvatarId) {
    chosenAvatarRecord = (await prisma.avatar.findUnique({ where: { id: options.preferredAvatarId } })) || undefined;
  }

  if (!chosenAvatarRecord) {
    chosenAvatarRecord = stockAvatars[0] || { id: "avatar_emma", gender: "Female" };
  }

  const chosenAvatar = chosenAvatarRecord.id;
  const avatarGender = (chosenAvatarRecord.gender || "Female").toLowerCase();

  // 2. Strict Gender Voice Matching: Female Avatar -> Female Voice, Male Avatar -> Male Voice
  const compatibleVoices = stockVoices.filter(
    (v) => (v.gender || "").toLowerCase() === avatarGender
  );

  let chosenVoice: string;
  if (options.preferredVoiceId) {
    const preferredVoice = stockVoices.find((v) => v.id === options.preferredVoiceId);
    if (preferredVoice && (preferredVoice.gender || "").toLowerCase() === avatarGender) {
      chosenVoice = preferredVoice.id;
    } else {
      // Auto-correct mismatched voice to avatar's gender
      chosenVoice = compatibleVoices[0]?.id || (avatarGender === "male" ? "voice_ben" : "voice_annie");
    }
  } else {
    chosenVoice = compatibleVoices[0]?.id || (avatarGender === "male" ? "voice_ben" : "voice_annie");
  }

  let scenes: AgentScenePlan[] = [];

  if (process.env.GEMINI_API_KEY) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": process.env.GEMINI_API_KEY,
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are an elite AI Video Director and Producer. Given this user prompt: "${prompt}", create a structured 3-scene video plan.
Tone: ${tone}. Target duration: ${durationSeconds} seconds.
Output strictly valid JSON (no markdown formatting, no code fences) with this exact schema:
{
  "projectName": "Short Descriptive Title",
  "scenes": [
    {
      "orderIndex": 0,
      "title": "Hook / Intro",
      "scriptText": "Voiceover script text...",
      "headlineText": "On-screen Headline",
      "subtitleText": "On-screen subtitle",
      "durationSeconds": 8.0,
      "backgroundValue": "#0b101c"
    }
  ]
}`,
                  },
                ],
              },
            ],
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (rawText) {
          const cleanJson = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
          const parsed = JSON.parse(cleanJson);
          if (Array.isArray(parsed.scenes) && parsed.scenes.length > 0) {
            scenes = parsed.scenes.map((s: any, idx: number) => ({
              orderIndex: idx,
              title: s.title || `Scene ${idx + 1}`,
              scriptText: s.scriptText,
              headlineText: s.headlineText,
              subtitleText: s.subtitleText,
              durationSeconds: s.durationSeconds || Math.round(durationSeconds / parsed.scenes.length),
              avatarId: chosenAvatar,
              voiceId: chosenVoice,
              backgroundValue: s.backgroundValue || (idx % 2 === 0 ? "#0c111e" : "#111827"),
              captionsEnabled: true,
            }));

            return {
              projectName: parsed.projectName || "AI Agent Video",
              orientation: aspectRatio === "9:16" ? "portrait" : "landscape",
              recommendedAvatarId: chosenAvatar,
              recommendedVoiceId: chosenVoice,
              scenes,
              estimatedCredits: scenes.length * 10,
            };
          }
        }
      }
    } catch (err) {
      console.warn("Gemini agent plan generation fallback:", err);
    }
  }

  // High quality deterministic fallback generator
  const cleanPrompt = prompt.trim();
  const perSceneDuration = Math.round(durationSeconds / 3);

  scenes = [
    {
      orderIndex: 0,
      title: "Hook & Problem",
      scriptText: `Are you looking for the most powerful way to achieve results with ${cleanPrompt}? Here is why traditional workflows hold you back.`,
      headlineText: `Unlock ${cleanPrompt.slice(0, 30)}`,
      subtitleText: "A smarter approach to automated video",
      durationSeconds: perSceneDuration,
      avatarId: chosenAvatar,
      voiceId: chosenVoice,
      backgroundValue: "#0c111e",
      captionsEnabled: true,
    },
    {
      orderIndex: 1,
      title: "Core Solution & Demonstration",
      scriptText: `With VidoAI, you can transform high-level concepts into studio-quality videos in seconds, without cameras, studios, or editing complexity.`,
      headlineText: "Studio Quality in Seconds",
      subtitleText: "AI avatars, cloned voices, and multi-scene timelines",
      durationSeconds: perSceneDuration,
      avatarId: chosenAvatar,
      voiceId: chosenVoice,
      backgroundValue: "#111728",
      captionsEnabled: true,
    },
    {
      orderIndex: 2,
      title: "Call to Action",
      scriptText: `Experience the future of personalized video content today. Try VidoAI and scale your reach exponentially.`,
      headlineText: "Get Started Today",
      subtitleText: "Empower your creative pipeline with VidoAI",
      durationSeconds: perSceneDuration,
      avatarId: chosenAvatar,
      voiceId: chosenVoice,
      backgroundValue: "#0a0e19",
      captionsEnabled: true,
    },
  ];

  return {
    projectName: `Video: ${cleanPrompt.slice(0, 32)}`,
    orientation: aspectRatio === "9:16" ? "portrait" : "landscape",
    recommendedAvatarId: chosenAvatar,
    recommendedVoiceId: chosenVoice,
    scenes,
    estimatedCredits: scenes.length * 10,
  };
}

export async function createProjectFromAgentPlan(
  workspaceId: string,
  userId: string,
  plan: AgentVideoPlan
) {
  return await prisma.$transaction(async (tx) => {
    const project = await tx.project.create({
      data: {
        workspaceId,
        ownerUserId: userId,
        name: plan.projectName,
        orientation: plan.orientation,
        status: "draft",
      },
    });

    for (const sc of plan.scenes) {
      const sceneRecord = await tx.scene.create({
        data: {
          projectId: project.id,
          orderIndex: sc.orderIndex,
          scriptText: sc.scriptText,
          avatarId: sc.avatarId,
          avatarPose: JSON.stringify({ x: 50, y: 50, scale: 1.0 }),
          voiceId: sc.voiceId,
          backgroundValue: sc.backgroundValue,
          durationSeconds: sc.durationSeconds,
          captionsEnabled: sc.captionsEnabled,
        },
      });

      if (sc.headlineText) {
        await tx.textOverlay.create({
          data: {
            sceneId: sceneRecord.id,
            text: sc.headlineText,
            font: "Inter",
            size: 36,
            color: "#ffffff",
            positionX: 50.0,
            positionY: 20.0,
          },
        });
      }

      if (sc.subtitleText) {
        await tx.textOverlay.create({
          data: {
            sceneId: sceneRecord.id,
            text: sc.subtitleText,
            font: "Inter",
            size: 20,
            color: "#67E8F9",
            positionX: 50.0,
            positionY: 30.0,
          },
        });
      }
    }

    return project;
  });
}
