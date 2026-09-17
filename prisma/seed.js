const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with default plans, avatars, voices, and demo user...');

  // 1. Plans
  const plans = [
    {
      id: 'plan_free',
      name: 'Free',
      monthlyPriceCents: 0,
      annualPriceCents: 0,
      seatsIncluded: 1,
      creditsIncluded: 100,
      maxVideoMinutes: 5,
      resolutionCap: '720p',
      watermarkForced: true,
    },
    {
      id: 'plan_pro',
      name: 'Pro Creator',
      monthlyPriceCents: 2900,
      annualPriceCents: 29000,
      seatsIncluded: 1,
      creditsIncluded: 1000,
      maxVideoMinutes: 30,
      resolutionCap: '1080p',
      watermarkForced: false,
    },
    {
      id: 'plan_business',
      name: 'Business',
      monthlyPriceCents: 8900,
      annualPriceCents: 89000,
      seatsIncluded: 3,
      creditsIncluded: 5000,
      maxVideoMinutes: 120,
      resolutionCap: '4K',
      watermarkForced: false,
    },
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { id: plan.id },
      update: plan,
      create: plan,
    });
  }
  console.log('✔ Plans seeded.');

  // 2. Demo User: Riya
  const hashedPassword = await bcrypt.hash('Password123!', 10);
  const user = await prisma.user.upsert({
    where: { email: 'riya@vidoai.com' },
    update: {
      fullName: 'Riya',
      passwordHash: hashedPassword,
      role: 'creator',
    },
    create: {
      email: 'riya@vidoai.com',
      fullName: 'Riya',
      passwordHash: hashedPassword,
      avatarUrl: 'R',
      role: 'creator',
    },
  });
  console.log('✔ Demo user "riya@vidoai.com" seeded.');

  // 3. Workspace for Riya
  let workspace = await prisma.workspace.findFirst({
    where: { createdByUserId: user.id },
  });

  if (!workspace) {
    workspace = await prisma.workspace.create({
      data: {
        name: "Riya's Studio",
        createdByUserId: user.id,
        members: {
          create: {
            userId: user.id,
            role: 'super_admin',
            status: 'active',
          },
        },
        brandKit: {
          create: {
            name: "Default Brand Kit",
            primaryColor: "#0f172a",
            accentColor: "#06b6d4",
            secondaryColor: "#8b5cf6",
            fontFamily: "Inter",
          },
        },
      },
    });
  }
  console.log('✔ Workspace created:', workspace.name);

  // 4. Credit Ledger Grant (+1000 Credits)
  const existingLedger = await prisma.creditLedger.findFirst({
    where: { workspaceId: workspace.id },
  });

  if (!existingLedger) {
    await prisma.creditLedger.create({
      data: {
        workspaceId: workspace.id,
        delta: 1000,
        reason: 'grant',
        balanceAfter: 1000,
      },
    });
    console.log('✔ Granted 1000 initial credits in CreditLedger.');
  }

  // 5. Stock Avatars
  const stockAvatars = [
    {
      id: 'avatar_emma',
      name: 'Emma in Navy Blazer',
      type: 'public',
      status: 'ready',
      gender: 'Female',
      category: 'Corporate',
      attire: 'Business Professional',
      thumbnailUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop',
      previewVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      visibility: 'public',
    },
    {
      id: 'avatar_riya',
      name: 'Riya - Casual Modern',
      type: 'public',
      status: 'ready',
      gender: 'Female',
      category: 'Creator',
      attire: 'Modern Casual',
      thumbnailUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop',
      previewVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      visibility: 'public',
    },
    {
      id: 'avatar_alex',
      name: 'Alex in Tech Hoodie',
      type: 'public',
      status: 'ready',
      gender: 'Male',
      category: 'Software',
      attire: 'Casual Hoodie',
      thumbnailUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop',
      previewVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
      visibility: 'public',
    },
    {
      id: 'avatar_sarah',
      name: 'Dr. Sarah Miller',
      type: 'public',
      status: 'ready',
      gender: 'Female',
      category: 'Healthcare',
      attire: 'Medical Coat',
      thumbnailUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=600&auto=format&fit=crop',
      previewVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
      visibility: 'public',
    },
    {
      id: 'avatar_marcus',
      name: 'Marcus Executive',
      type: 'public',
      status: 'ready',
      gender: 'Male',
      category: 'Executive',
      attire: 'Formal Suit',
      thumbnailUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=600&auto=format&fit=crop',
      previewVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
      visibility: 'public',
    },
  ];

  for (const avatar of stockAvatars) {
    await prisma.avatar.upsert({
      where: { id: avatar.id },
      update: avatar,
      create: avatar,
    });
  }
  console.log('✔ Stock avatars seeded.');

  // 6. Stock Voices
  const stockVoices = [
    {
      id: 'voice_annie',
      name: 'Annie - Lifelike',
      description: 'Natural, Explainer, Professional, Female, Ads, E-learning',
      gender: 'Female',
      ageGroup: 'Young adult',
      languageDefault: 'English (United States)',
      languageCode: 'en-US',
      providerVoiceId: '21m00Tcm4TlvDq8ikWAM',
      providerName: 'elevenlabs',
      visibility: 'public',
      type: 'stock',
    },
    {
      id: 'voice_hope',
      name: 'Hope',
      description: 'Young, Energetic, Social Media, Multilingual, Female',
      gender: 'Female',
      ageGroup: 'Young adult',
      languageDefault: 'English (United States)',
      languageCode: 'en-US',
      providerVoiceId: 'EXAVITQu4vr4xnSDxMaL',
      providerName: 'elevenlabs',
      visibility: 'public',
      type: 'stock',
    },
    {
      id: 'voice_ben',
      name: 'Ben',
      description: 'Captivating, Warm, Middle Aged, Multilingual, Male',
      gender: 'Male',
      ageGroup: 'Middle-aged',
      languageDefault: 'English (United States)',
      languageCode: 'en-US',
      providerVoiceId: 'ErXwobaYiN019PkySvjV',
      providerName: 'elevenlabs',
      visibility: 'public',
      type: 'stock',
    },
    {
      id: 'voice_archer',
      name: 'Archer',
      description: 'Middle Aged, Soothing, British Accent, Male',
      gender: 'Male',
      ageGroup: 'Middle-aged',
      languageDefault: 'English (United Kingdom)',
      languageCode: 'en-GB',
      providerVoiceId: 'VR6AewLTigWG4xSOukaG',
      providerName: 'elevenlabs',
      visibility: 'public',
      type: 'stock',
    },
    {
      id: 'voice_monika',
      name: 'Monika Sogam',
      description: 'Enticing, Advertisement, Clear Hindi & English, Female',
      gender: 'Female',
      ageGroup: 'Middle-aged',
      languageDefault: 'Hindi (India)',
      languageCode: 'hi-IN',
      providerVoiceId: 'pNInz6obpgDQGcFmaJgB',
      providerName: 'elevenlabs',
      visibility: 'public',
      type: 'stock',
    },
  ];

  for (const voice of stockVoices) {
    await prisma.voice.upsert({
      where: { id: voice.id },
      update: voice,
      create: voice,
    });
  }
  console.log('✔ Stock voices seeded.');

  // 7. Initial Demo Project with 2 Scenes
  let project = await prisma.project.findFirst({
    where: { ownerUserId: user.id },
  });

  if (!project) {
    project = await prisma.project.create({
      data: {
        name: 'Product Explainer Video',
        workspaceId: workspace.id,
        ownerUserId: user.id,
        orientation: 'landscape',
        status: 'draft',
        scenes: {
          create: [
            {
              orderIndex: 0,
              scriptText: 'Welcome to VidoAI! Create engaging, studio-quality videos with realistic AI avatars in seconds.',
              avatarId: 'avatar_emma',
              voiceId: 'voice_annie',
              durationSeconds: 8.0,
              backgroundType: 'color',
              backgroundValue: '#0b101c',
              captionsEnabled: true,
            },
            {
              orderIndex: 1,
              scriptText: 'Customize your script, choose from dozens of natural voices, and render your polished MP4 with a single click.',
              avatarId: 'avatar_riya',
              voiceId: 'voice_hope',
              durationSeconds: 7.0,
              backgroundType: 'color',
              backgroundValue: '#12192c',
              captionsEnabled: true,
            },
          ],
        },
      },
    });
    console.log('✔ Demo project created with 2 scenes.');
  }

  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
