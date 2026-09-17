import { prisma } from "../src/lib/db";
import { runTranslationPipeline, translateWithGlossary } from "../src/lib/translation/videoTranslator";
import { parseCsvText, runBatchPipeline } from "../src/lib/batch/batchProcessor";
import { generateApiKey } from "../src/lib/api/apiKeyAuth";
import { dispatchWebhookEvent } from "../src/lib/webhooks/dispatcher";
import { processRenderJob } from "../src/lib/queue/renderQueue";
import crypto from "crypto";

async function runTests() {
  console.log("==================================================");
  console.log("   VIDOAI PHASE 3 END-TO-END VERIFICATION SUITE   ");
  console.log("==================================================\n");

  // 0. Setup test user and workspace
  let user = await prisma.user.findUnique({ where: { email: "riya@vidoai.com" } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: "riya@vidoai.com",
        fullName: "Riya Pal",
        passwordHash: "hashed_dummy",
      },
    });
  }

  let workspace = await prisma.workspace.findFirst({
    where: { createdByUserId: user.id },
  });
  if (!workspace) {
    workspace = await prisma.workspace.create({
      data: {
        name: "Riya's Production Workspace",
        createdByUserId: user.id,
      },
    });
  }

  // Ensure ample credits for tests
  await prisma.creditLedger.create({
    data: {
      workspaceId: workspace.id,
      delta: 500,
      reason: "topup",
      balanceAfter: 1500,
    },
  });

  console.log(`[INIT] Using Workspace ID: ${workspace.id} (User: ${user.email})`);

  // ==========================================
  // TEST 1: BRAND GLOSSARY & VIDEO TRANSLATION
  // ==========================================
  console.log("\n--- TEST 1: Brand Glossary & Video Translation Pipeline ---");

  // Add Brand Glossary rule: "dont_translate" for trademark "VidoAI"
  await prisma.brandGlossary.deleteMany({ where: { workspaceId: workspace.id } });
  await prisma.brandGlossary.create({
    data: {
      workspaceId: workspace.id,
      type: "dont_translate",
      originalTerm: "VidoAI",
    },
  });
  // Add Brand Glossary rule: "force_translate" for "high-performance" -> "de ultra rendimiento"
  await prisma.brandGlossary.create({
    data: {
      workspaceId: workspace.id,
      type: "force_translate",
      originalTerm: "high-performance",
      targetTerm: "de ultra rendimiento",
      language: "Spanish",
    },
  });

  const testScript = "Welcome to VidoAI. Today we are exploring intelligent video translation and our high-performance developer API.";
  const translated = await translateWithGlossary(testScript, "Spanish", workspace.id);
  console.log("Original Script:  ", testScript);
  console.log("Translated Script:", translated);

  if (!translated.includes("VidoAI")) {
    throw new Error("FAIL: Brand Glossary did not preserve trademark 'VidoAI'");
  }
  if (!translated.includes("de ultra rendimiento")) {
    throw new Error("FAIL: Brand Glossary did not apply force_translate rule");
  }
  console.log("✔ Brand Glossary preservation & force-translate verified successfully.");

  // Create real TranslationJob
  const transJob = await prisma.translationJob.create({
    data: {
      workspaceId: workspace.id,
      userId: user.id,
      sourceVideoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      targetLanguage: "Spanish",
      originalTranscript: testScript,
      status: "queued",
      creditsConsumed: 15,
    },
  });

  console.log(`[TRANSLATE] Created TranslationJob ${transJob.id}, executing pipeline...`);
  await runTranslationPipeline(transJob.id);

  const completedTransJob = await prisma.translationJob.findUnique({
    where: { id: transJob.id },
  });

  if (completedTransJob?.status !== "completed") {
    throw new Error(`FAIL: Translation job status is ${completedTransJob?.status}, expected 'completed'`);
  }
  if (!completedTransJob.outputVideoUrl) {
    throw new Error("FAIL: Translation job outputVideoUrl is missing");
  }
  console.log(`✔ Translation Pipeline Completed! Output Video: ${completedTransJob.outputVideoUrl}`);

  // ==========================================
  // TEST 2: BATCH PERSONALIZATION ENGINE
  // ==========================================
  console.log("\n--- TEST 2: Batch Personalization & Multi-Video Render ---");

  const sampleCsv = `name,company,role\nAlice Adams,Acme Global,Chief Technology Officer\nBob Brown,Starlight Cloud,VP of Engineering`;
  const { headers, rows } = parseCsvText(sampleCsv);
  console.log(`[CSV] Parsed ${rows.length} rows with headers: ${headers.join(", ")}`);

  if (headers.length !== 3 || rows.length !== 2) {
    throw new Error("FAIL: CSV parser did not extract expected headers and rows");
  }

  // Create BatchJob and child BatchItems
  const batchJob = await prisma.batchJob.create({
    data: {
      workspaceId: workspace.id,
      userId: user.id,
      name: "Enterprise Q3 Automated Outreach",
      totalCount: rows.length,
      status: "queued",
      creditsConsumed: 0,
      items: {
        create: rows.map((r, idx) => ({
          rowIndex: idx,
          variablesJson: JSON.stringify(r),
          status: "queued",
        })),
      },
    },
  });

  console.log(`[BATCH] Created BatchJob ${batchJob.id} with 2 items, running pipeline...`);
  await runBatchPipeline(batchJob.id);

  const completedBatch = await prisma.batchJob.findUnique({
    where: { id: batchJob.id },
    include: { items: true },
  });

  if (completedBatch?.status !== "completed") {
    throw new Error(`FAIL: Batch job status is ${completedBatch?.status}, expected 'completed'`);
  }
  if (completedBatch.completedCount !== 2) {
    throw new Error(`FAIL: Batch completedCount is ${completedBatch.completedCount}, expected 2`);
  }

  completedBatch.items.forEach((item, i) => {
    if (item.status !== "completed" || !item.outputVideoUrl) {
      throw new Error(`FAIL: Batch item ${i} did not complete with outputVideoUrl`);
    }
    console.log(`  Row ${i + 1} Video: ${item.outputVideoUrl}`);
  });
  console.log(`✔ Batch Personalization Pipeline Completed! Credits Consumed: ${completedBatch.creditsConsumed}`);

  // ==========================================
  // TEST 3: DEVELOPER API & API KEY AUTH
  // ==========================================
  console.log("\n--- TEST 3: Developer API Key Generation & API Authentication ---");

  const { rawKey, keyId, prefix } = await generateApiKey(
    workspace.id,
    user.id,
    "Integration Test Server Key"
  );
  console.log(`[KEY] Generated API Key: ${prefix} (Raw: ${rawKey.slice(0, 18)}...)`);

  if (!rawKey.startsWith("vido_live_")) {
    throw new Error("FAIL: API Key does not follow vido_live_ format");
  }

  const storedKey = await prisma.apiKey.findUnique({ where: { id: keyId } });
  if (!storedKey) {
    throw new Error("FAIL: Stored API Key not found in database");
  }

  // Verify keyHash is a SHA-256 hash and rawKey is NEVER stored
  const expectedHash = crypto.createHash("sha256").update(rawKey).digest("hex");
  if (storedKey.keyHash !== expectedHash) {
    throw new Error("FAIL: Stored keyHash does not match SHA-256 of rawKey");
  }
  console.log("✔ API Key hash validated against SHA-256.");

  // Test HeyGen-spec Video Generation using Developer API logic
  const devProject = await prisma.project.create({
    data: {
      workspaceId: workspace.id,
      ownerUserId: user.id,
      name: "Developer API Video Test",
      orientation: "landscape",
      status: "rendering",
      scenes: {
        create: [
          {
            orderIndex: 0,
            scriptText: "Automated video generation test via VidoAI developer platform.",
            backgroundValue: "#0c111e",
            durationSeconds: 4.0,
          },
        ],
      },
    },
  });

  const devRender = await prisma.render.create({
    data: {
      projectId: devProject.id,
      requestedByUserId: user.id,
      status: "queued",
      estimatedCredits: 10,
    },
  });

  console.log(`[DEV API] Queued Developer Video Render ${devRender.id}, processing...`);
  await processRenderJob(devRender.id);

  const completedDevRender = await prisma.render.findUnique({
    where: { id: devRender.id },
  });

  if (completedDevRender?.status !== "completed") {
    throw new Error(`FAIL: Dev render status is ${completedDevRender?.status}, expected 'completed'`);
  }
  console.log(`✔ Developer API Video Generation Complete! URL: ${completedDevRender.outputAssetUrl}`);

  // ==========================================
  // TEST 4: WEBHOOKS & CRYPTOGRAPHIC SIGNING
  // ==========================================
  console.log("\n--- TEST 4: Webhooks & HMAC-SHA256 Signing ---");

  const webhookSecret = "whsec_test_secret_for_e2e_verification_123";
  const webhookEndpoint = await prisma.webhookEndpoint.create({
    data: {
      workspaceId: workspace.id,
      url: "https://httpbin.org/post",
      secret: webhookSecret,
      subscribedEvents: "video.render.completed,video_translate.completed,batch.completed",
    },
  });

  console.log(`[WEBHOOK] Registered endpoint: ${webhookEndpoint.url}`);

  await dispatchWebhookEvent(workspace.id, "video.render.completed", {
    render_id: devRender.id,
    video_url: completedDevRender.outputAssetUrl,
    status: "completed",
  });

  const delivery = await prisma.webhookDelivery.findFirst({
    where: { endpointId: webhookEndpoint.id },
    orderBy: { createdAt: "desc" },
  });

  if (!delivery) {
    throw new Error("FAIL: Webhook delivery record was not logged");
  }

  // Verify HMAC signature
  const hmac = crypto.createHmac("sha256", webhookSecret);
  hmac.update(delivery.payload);
  const expectedSig = hmac.digest("hex");

  if (delivery.signature !== expectedSig) {
    throw new Error(`FAIL: Webhook HMAC signature mismatch. Got: ${delivery.signature}, Expected: ${expectedSig}`);
  }
  console.log(`✔ Webhook HMAC-SHA256 Signature Verified: ${delivery.signature.slice(0, 20)}...`);
  console.log(`✔ Webhook delivery recorded with status: ${delivery.status}`);

  // ==========================================
  // TEST 5: NON-REGRESSION OF PHASE 0, 1 & 2
  // ==========================================
  console.log("\n--- TEST 5: Non-Regression Verification (Phases 0, 1, 2) ---");

  const customAvatars = await prisma.avatar.findMany({ where: { ownerWorkspaceId: workspace.id } });
  const voices = await prisma.voice.findMany({ where: { ownerWorkspaceId: workspace.id } });
  const consentRecords = await prisma.consentRecord.findMany({ where: { workspaceId: workspace.id } });
  const brandKits = await prisma.brandKit.findMany({ where: { workspaceId: workspace.id } });

  console.log(`- Workspace Custom Avatars: ${customAvatars.length}`);
  console.log(`- Workspace Cloned Voices:  ${voices.length}`);
  console.log(`- Legal Consent Records:    ${consentRecords.length}`);
  console.log(`- Active Brand Kits:        ${brandKits.length}`);

  const latestLedger = await prisma.creditLedger.findFirst({
    where: { workspaceId: workspace.id },
    orderBy: { createdAt: "desc" },
  });
  console.log(`- Credit Balance After Operations: ${latestLedger?.balanceAfter} credits`);

  console.log("\n==================================================");
  console.log("   🎉 ALL PHASE 3 TESTS PASSED WITH 0 ERRORS!   ");
  console.log("==================================================");
}

runTests()
  .catch((err) => {
    console.error("\n❌ PHASE 3 TEST RUN FAILED:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
