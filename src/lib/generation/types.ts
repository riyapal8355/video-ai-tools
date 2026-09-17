export interface TTSOptions {
  speed?: number;
  pitch?: number;
  styleTag?: string;
  languageCode?: string;
}

export interface TTSResult {
  audioUrl: string;
  audioDurationSeconds: number;
  wordTimestamps?: { word: string; start: number; end: number }[];
}

export interface AvatarGenerationOptions {
  pose?: { x: number; y: number; scale: number };
  aspectRatio?: "16:9" | "9:16";
}

export interface AvatarResult {
  videoUrl: string;
  durationSeconds: number;
}
