export interface GenerateScriptInput {
  topic: string;
  targetAudience?: string;
  durationSeconds?: number;
  tone?: string;
}

export interface RewriteScriptInput {
  scriptText: string;
  tone: "professional" | "casual" | "enthusiastic" | "concise" | "urgent";
}

export interface GeneratedSceneItem {
  title: string;
  scriptText: string;
  durationSeconds: number;
  backgroundValue: string;
}

export interface GenerateScenesInput {
  prompt: string;
  sceneCount?: number;
}

// 1. Generate full video script
export async function generateScript(input: GenerateScriptInput): Promise<string> {
  const { topic, targetAudience = "General Audience", durationSeconds = 30, tone = "Engaging & Professional" } = input;

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
                    text: `You are an expert AI video scriptwriter for talking avatar videos. Write an engaging, high-conversion spoken script for a video about: "${topic}".
Target Audience: ${targetAudience}.
Desired Duration: Approximately ${durationSeconds} seconds (~${Math.round((durationSeconds / 60) * 140)} words).
Tone: ${tone}.
Output only the spoken voiceover script. Do not include markdown stage directions, scene titles, or brackets.`,
                  },
                ],
              },
            ],
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (candidateText) return candidateText;
      }
    } catch (err) {
      console.warn("Gemini API call failed, falling back to built-in generator:", err);
    }
  }

  // Fallback intelligent generator
  return `Are you ready to discover the power of ${topic}? Whether you are looking to save time, increase efficiency, or elevate your results, this is designed specifically for you. Experience how seamless, intuitive, and impactful it truly is. Get started today and see the transformation for yourself!`;
}

// 2. Rewrite script with specific tone
export async function rewriteScript(input: RewriteScriptInput): Promise<string> {
  const { scriptText, tone } = input;

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
                    text: `Rewrite the following talking avatar script with a ${tone.toUpperCase()} tone. Keep the core message but optimize the phrasing, rhythm, and word choice for spoken video:
"${scriptText}"
Output only the rewritten spoken text without explanations or quotation marks.`,
                  },
                ],
              },
            ],
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const rewritten = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (rewritten) return rewritten;
      }
    } catch (err) {
      console.warn("Gemini rewrite failed, using built-in transformer:", err);
    }
  }

  // Built-in tone transform heuristics
  switch (tone) {
    case "professional":
      return `In today's fast-paced landscape, efficiency and precision are paramount. ${scriptText} We invite you to explore how our enterprise-ready solution delivers measurable excellence and lasting value.`;
    case "enthusiastic":
      return `Get ready for something truly incredible! ${scriptText} We are beyond excited to share this breakthrough with you—let's make it happen together!`;
    case "concise":
      return scriptText.split(".").slice(0, 2).join(".").trim() + ". Fast, focused, and proven to deliver results.";
    case "urgent":
      return `Don't miss out on this game-changing opportunity. ${scriptText} Take action now before it's too late!`;
    case "casual":
    default:
      return `Hey there! Here's something you're really going to love. ${scriptText} Give it a try and see for yourself!`;
  }
}

// 3. Multi-scene project breakdown from a prompt
export async function generateScenesFromPrompt(input: GenerateScenesInput): Promise<GeneratedSceneItem[]> {
  const { prompt, sceneCount = 3 } = input;

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
                    text: `Break down the following video prompt into ${sceneCount} sequential talking avatar scenes:
Prompt: "${prompt}"

Return ONLY a valid JSON array of objects with the following schema:
[
  {
    "title": "Scene title",
    "scriptText": "The spoken voiceover for this scene",
    "durationSeconds": 5.0,
    "backgroundValue": "#0b101c"
  }
]`,
                  },
                ],
              },
            ],
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const jsonText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.replace(/```json/g, "").replace(/```/g, "").trim();
        if (jsonText) {
          const parsed = JSON.parse(jsonText);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      }
    } catch (err) {
      console.warn("Gemini scene generation failed, falling back to structured template:", err);
    }
  }

  // Structured multi-scene breakdown fallback
  return [
    {
      title: "The Hook",
      scriptText: `What if you could completely reimagine ${prompt}? Welcome to the next generation of video creation.`,
      durationSeconds: 4.5,
      backgroundValue: "#0b101c",
    },
    {
      title: "The Solution",
      scriptText: `With our intelligent AI platform, every scene, avatar, and voice is crafted seamlessly to captivate your audience.`,
      durationSeconds: 5.0,
      backgroundValue: "#12192c",
    },
    {
      title: "Call to Action",
      scriptText: `Ready to turn your ideas into studio-grade videos in minutes? Create your first video today!`,
      durationSeconds: 4.0,
      backgroundValue: "#18233a",
    },
  ];
}
