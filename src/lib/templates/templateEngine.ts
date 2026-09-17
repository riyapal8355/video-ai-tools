import { prisma } from "@/lib/db";

export interface TemplateSceneDefinition {
  title: string;
  scriptText: string;
  headline?: string;
  subtitle?: string;
  durationSeconds?: number;
  avatarEngine?: string;
  layout?: string;
  backgroundType?: string;
  backgroundColor?: string;
}

export interface PrebuiltTemplate {
  id: string;
  title: string;
  description: string;
  category: "marketing" | "sales" | "explainer" | "social" | "training";
  aspectRatio: "16:9" | "9:16" | "1:1";
  thumbnailUrl: string;
  previewVideoUrl?: string;
  isFeatured?: boolean;
  scenes: TemplateSceneDefinition[];
}

export const PREBUILT_TEMPLATES: PrebuiltTemplate[] = [
  {
    id: "tpl-prompt-course",
    title: "AI Prompt Engineering Course",
    description: "Professional multi-scene curriculum video teaching enterprise role-playing and context calibration.",
    category: "training",
    aspectRatio: "16:9",
    thumbnailUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=700&auto=format&fit=crop",
    isFeatured: true,
    scenes: [
      {
        title: "Chapter 4: Role-Playing Technique",
        headline: "Getting Better Results with the Role-Playing Technique",
        subtitle: "The 4-stage system for domain-specific agent reasoning",
        scriptText: "Welcome to chapter 4. Today we dive into role prompting, the highest leverage technique to unlock nuanced domain reasoning in modern LLMs.",
        durationSeconds: 12,
        layout: "center",
      },
      {
        title: "Context Calibration",
        headline: "Establish Clear Roles & Constraints",
        subtitle: "Setting persona identity, knowledge domain, and style boundaries",
        scriptText: "Notice how explicitly defining the persona eliminates ambiguity and forces the model into high-precision technical outputs.",
        durationSeconds: 10,
        layout: "split-right",
      },
      {
        title: "Blueprint Slide",
        headline: "The System Prompt Blueprint",
        subtitle: "Structuring role directives vs user task inputs",
        scriptText: "By isolating system directives from dynamic user inputs, you safeguard against prompt injection while maximizing reliability.",
        durationSeconds: 12,
        layout: "split-left",
      },
    ],
  },
  {
    id: "tpl-b2b-saas",
    title: "B2B SaaS Product Demo Walkthrough",
    description: "High-converting product demo video highlighting core feature highlights and customer ROI.",
    category: "sales",
    aspectRatio: "16:9",
    thumbnailUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop",
    isFeatured: true,
    scenes: [
      {
        title: "The Problem Hook",
        headline: "Legacy Workflows Are Costing You Hours",
        subtitle: "Manual video creation is slow, expensive, and fragmented",
        scriptText: "If your team is still spending weeks coordinating shoots and voice actors, you are falling behind your competition.",
        durationSeconds: 9,
        layout: "center",
      },
      {
        title: "Product Solution",
        headline: "VidoAI Generates Studio Quality in Minutes",
        subtitle: "Script to 4K photorealistic avatar in 1 click",
        scriptText: "With VidoAI, you simply enter your script, pick a digital twin, and render pixel-perfect video presentations in under 60 seconds.",
        durationSeconds: 11,
        layout: "split-right",
      },
      {
        title: "Call To Action",
        headline: "Start Your 14-Day Free Enterprise Trial",
        subtitle: "No credit card required. Experience the future of content.",
        scriptText: "Join over 50,000 forward-thinking teams today. Click below to start your free trial now.",
        durationSeconds: 8,
        layout: "center",
      },
    ],
  },
  {
    id: "tpl-tiktok-viral",
    title: "Viral Social Commerce Hook Ad",
    description: "Punchy 9:16 portrait video template optimized for TikTok, Instagram Reels, and YouTube Shorts.",
    category: "social",
    aspectRatio: "9:16",
    thumbnailUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop",
    isFeatured: true,
    scenes: [
      {
        title: "The Stop-Scroll Hook",
        headline: "Stop Scrolling If You Want 10x ROI",
        subtitle: "The secret top creators use daily",
        scriptText: "Stop scrolling! Here is the exact AI tool that generated over one hundred thousand dollars in organic sales this month.",
        durationSeconds: 6,
        layout: "center",
      },
      {
        title: "Feature Demo",
        headline: "Instant Personalized Twins",
        subtitle: "Clone your voice and look in 2 minutes",
        scriptText: "All you do is record a 10 second voice sample, and it generates thousands of personalized video variations for every customer.",
        durationSeconds: 8,
        layout: "center",
      },
      {
        title: "Viral CTA",
        headline: "Link in Bio - Claim Free Credits",
        subtitle: "Limited time launch bonus",
        scriptText: "Tap the link in our bio right now to grab 50 free credits before this offer expires!",
        durationSeconds: 6,
        layout: "center",
      },
    ],
  },
  {
    id: "tpl-employee-onboarding",
    title: "New Employee HR Onboarding",
    description: "Warm, structured welcome video for newly hired team members covering values and first week setup.",
    category: "explainer",
    aspectRatio: "16:9",
    thumbnailUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=800&auto=format&fit=crop",
    isFeatured: false,
    scenes: [
      {
        title: "Welcome to the Team",
        headline: "Welcome to the Company Family!",
        subtitle: "We are thrilled to have your talents with us",
        scriptText: "Welcome! We are incredibly excited to welcome you to our growing global team. Here is everything you need to know for day one.",
        durationSeconds: 10,
        layout: "center",
      },
      {
        title: "Core Values",
        headline: "Our Core Operating Principles",
        subtitle: "Integrity, Velocity, and Customer Obsession",
        scriptText: "Our mission centers around customer obsession and rapid iteration. You have full ownership to build and make an impact.",
        durationSeconds: 11,
        layout: "split-left",
      },
    ],
  },
];

export async function ensureTemplatesSeeded() {
  const existingCount = await prisma.template.count();
  if (existingCount > 0) return;

  for (const tpl of PREBUILT_TEMPLATES) {
    await prisma.template.create({
      data: {
        id: tpl.id,
        title: tpl.title,
        description: tpl.description,
        category: tpl.category,
        aspectRatio: tpl.aspectRatio,
        thumbnailUrl: tpl.thumbnailUrl,
        scenesJson: JSON.stringify(tpl.scenes),
        isFeatured: tpl.isFeatured ?? false,
      },
    });
  }
}

export async function instantiateTemplate(
  templateId: string,
  workspaceId: string,
  userId: string,
  customTitle?: string
) {
  await ensureTemplatesSeeded();

  let template = await prisma.template.findUnique({
    where: { id: templateId },
  });

  if (!template) {
    const fallback = PREBUILT_TEMPLATES.find((t) => t.id === templateId) || PREBUILT_TEMPLATES[0];
    template = await prisma.template.create({
      data: {
        id: fallback.id,
        title: fallback.title,
        description: fallback.description,
        category: fallback.category,
        aspectRatio: fallback.aspectRatio,
        thumbnailUrl: fallback.thumbnailUrl,
        scenesJson: JSON.stringify(fallback.scenes),
        isFeatured: fallback.isFeatured ?? false,
      },
    });
  }

  const scenesData: TemplateSceneDefinition[] = JSON.parse(template.scenesJson || "[]");

  const defaultAvatar = await prisma.avatar.findFirst({
    where: { status: "ready" },
  });

  const defaultVoice = await prisma.voice.findFirst({
    where: { status: "ready" },
  });

  const project = await prisma.project.create({
    data: {
      workspaceId,
      ownerUserId: userId,
      name: customTitle || template.title,
      orientation: template.aspectRatio === "9:16" ? "portrait" : "landscape",
      sourceTemplateId: template.id,
      status: "draft",
      scenes: {
        create: scenesData.map((sc, index) => ({
          orderIndex: index,
          scriptText: sc.scriptText,
          avatarId: defaultAvatar?.id || null,
          voiceId: defaultVoice?.id || null,
          durationSeconds: sc.durationSeconds || 10,
          backgroundType: sc.backgroundType || "color",
          backgroundValue: sc.backgroundColor || "#0a0f1d",
          captionsEnabled: true,
        })),
      },
    },
    include: {
      scenes: true,
    },
  });

  return project;
}
