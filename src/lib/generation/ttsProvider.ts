import fs from "fs";
import path from "path";
import { TTSOptions, TTSResult } from "./types";

// Voice ID mapping to natural Neural voices
const VOICE_MAP: Record<string, string> = {
  voice_annie: "en-US-JennyNeural",
  voice_hope: "en-US-AriaNeural",
  voice_ben: "en-US-GuyNeural",
  voice_archer: "en-US-ChristopherNeural",
  voice_monika: "en-IN-NeerjaNeural",
};

export async function generateSpeech(
  text: string,
  voiceId?: string,
  options?: TTSOptions
): Promise<TTSResult> {
  const cleanText = text.trim();
  if (!cleanText) {
    return {
      audioUrl: "",
      audioDurationSeconds: 1.0,
    };
  }

  // Approximate duration: ~140 words per minute = 2.33 words per second
  const wordCount = cleanText.split(/\s+/).length;
  const speed = options?.speed || 1.0;
  const estimatedSeconds = Math.max(1.5, wordCount / (2.33 * speed));

  const audioDir = path.join(process.cwd(), "public", "audio");
  if (!fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir, { recursive: true });
  }

  // 1. If ElevenLabs API Key is provided (Paid Option)
  if (process.env.ELEVENLABS_API_KEY && voiceId && voiceId.length > 10) {
    try {
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "xi-api-key": process.env.ELEVENLABS_API_KEY,
          },
          body: JSON.stringify({
            text: cleanText,
            model_id: "eleven_multilingual_v2",
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
              speed: speed,
            },
          }),
        }
      );

      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const fileName = `eleven_${Date.now()}_${Math.random().toString(36).slice(2, 7)}.mp3`;
        const localPath = path.join(audioDir, fileName);
        fs.writeFileSync(localPath, buffer);

        return {
          audioUrl: `/audio/${fileName}`,
          audioDurationSeconds: parseFloat(estimatedSeconds.toFixed(1)),
        };
      }
    } catch (err) {
      console.warn("ElevenLabs TTS error, falling back to free Neural TTS:", err);
    }
  }

  // 2. Free Neural TTS Engine (Edge TTS Universal - 100% Free, Zero API Key)
  try {
    process.env["WS_NO_BUFFER_UTIL"] = "true";
    const { Communicate } = require("edge-tts-universal");
    const targetVoice = (voiceId && VOICE_MAP[voiceId]) || (voiceId && voiceId.includes("Neural") ? voiceId : "en-US-JennyNeural");
    
    // Pitch & rate adjustment if specified
    const rateString = speed !== 1.0 ? `${Math.round((speed - 1.0) * 100)}%` : "+0%";
    const comm = new Communicate(cleanText, {
      voice: targetVoice,
      rate: rateString,
    });

    const audioChunks: Buffer[] = [];
    const wordTimestamps: { word: string; start: number; end: number }[] = [];

    for await (const chunk of comm.stream()) {
      if (chunk.type === "audio" && chunk.data) {
        audioChunks.push(Buffer.from(chunk.data));
      } else if (chunk.type === "WordBoundary" && chunk.text) {
        // chunk.offset is in 100-nanosecond units (ticks), 10,000,000 = 1 sec
        const startSec = (chunk.offset || 0) / 10000000;
        const durSec = (chunk.duration || 0) / 10000000;
        wordTimestamps.push({
          word: chunk.text,
          start: parseFloat(startSec.toFixed(2)),
          end: parseFloat((startSec + durSec).toFixed(2)),
        });
      }
    }

    if (audioChunks.length > 0) {
      const combinedBuffer = Buffer.concat(audioChunks);
      const fileName = `neural_${Date.now()}_${Math.random().toString(36).slice(2, 7)}.mp3`;
      const localPath = path.join(audioDir, fileName);
      fs.writeFileSync(localPath, combinedBuffer);

      const calculatedDuration = wordTimestamps.length > 0
        ? wordTimestamps[wordTimestamps.length - 1].end + 0.3
        : estimatedSeconds;

      return {
        audioUrl: `/audio/${fileName}`,
        audioDurationSeconds: parseFloat(calculatedDuration.toFixed(1)),
        wordTimestamps: wordTimestamps.length > 0 ? wordTimestamps : undefined,
      };
    }
  } catch (edgeErr: any) {
    console.warn("Free Neural TTS error, falling back to clean sample audio:", edgeErr?.message || edgeErr);
  }

  // 3. Clean fallback sample audio for offline/restricted environments
  const audioUrl = "/audio/sample_fallback.mp3";

  return {
    audioUrl: audioUrl,
    audioDurationSeconds: parseFloat(estimatedSeconds.toFixed(1)),
  };
}
