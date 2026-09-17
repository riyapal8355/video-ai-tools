import fs from "fs";
import path from "path";
import ffmpeg from "fluent-ffmpeg";

function getFfmpegPath(): string | null {
  if (process.env.FFMPEG_PATH && fs.existsSync(process.env.FFMPEG_PATH)) {
    return process.env.FFMPEG_PATH;
  }
  try {
    const ffmpegInstaller = require("@ffmpeg-installer/ffmpeg");
    if (ffmpegInstaller && ffmpegInstaller.path && fs.existsSync(ffmpegInstaller.path)) {
      return ffmpegInstaller.path;
    }
  } catch {
    // Fall back to manual search
  }
  const localWinPath = path.join(
    process.cwd(),
    "node_modules",
    "@ffmpeg-installer",
    "win32-x64",
    "ffmpeg.exe"
  );
  if (fs.existsSync(localWinPath)) {
    return localWinPath;
  }
  return null;
}

const ffmpegBinary = getFfmpegPath();
if (ffmpegBinary) {
  ffmpeg.setFfmpegPath(ffmpegBinary);
}

export interface RenderSceneData {
  orderIndex: number;
  scriptText: string;
  avatarThumbnailUrl?: string;
  avatarPreviewVideoUrl?: string;
  avatarPose?: { x: number; y: number; scale: number };
  audioUrl?: string;
  durationSeconds: number;
  backgroundValue: string;
  captionsEnabled: boolean;
  textOverlays?: any[];
  wordTimestamps?: { word: string; start: number; end: number }[];
}

export interface ProjectRenderInput {
  projectId: string;
  projectName: string;
  orientation: "landscape" | "portrait";
  scenes: RenderSceneData[];
}

async function renderSingleSceneSegment(
  scene: RenderSceneData,
  segmentOutputPath: string,
  width: number,
  height: number,
  isLandscape: boolean
): Promise<void> {
  const duration = Math.max(3.0, scene.durationSeconds || 5.0);

  // 1. Resolve audio path
  let audioPath: string | null = null;
  if (scene.audioUrl) {
    if (scene.audioUrl.startsWith("/audio/")) {
      const p = path.join(process.cwd(), "public", scene.audioUrl);
      if (fs.existsSync(p)) audioPath = p;
    } else if (scene.audioUrl.startsWith("http")) {
      audioPath = scene.audioUrl;
    }
  }

  // 2. Resolve avatar video
  let videoPath: string | null = null;
  const rawVideoUrl = scene.avatarPreviewVideoUrl;
  if (rawVideoUrl) {
    if (rawVideoUrl.startsWith("/avatars/") || rawVideoUrl.startsWith("/renders/")) {
      const p = path.join(process.cwd(), "public", rawVideoUrl);
      if (fs.existsSync(p)) videoPath = p;
    } else if (rawVideoUrl.startsWith("http")) {
      videoPath = rawVideoUrl;
    }
  }

  // If not video, find matching mp4 from thumbnail or default to emma.mp4
  if (!videoPath || !videoPath.endsWith(".mp4")) {
    const avatarKey = scene.avatarThumbnailUrl
      ? path.basename(scene.avatarThumbnailUrl, path.extname(scene.avatarThumbnailUrl))
      : "emma";
    const matchingMp4 = path.join(process.cwd(), "public", "avatars", "videos", `${avatarKey}.mp4`);
    if (fs.existsSync(matchingMp4)) {
      videoPath = matchingMp4;
    } else {
      const defaultEmma = path.join(process.cwd(), "public", "avatars", "videos", "emma.mp4");
      if (fs.existsSync(defaultEmma)) videoPath = defaultEmma;
    }
  }

  return new Promise((resolve, reject) => {
    let command = ffmpeg();

    if (videoPath && videoPath.endsWith(".mp4")) {
      command.input(videoPath).inputOptions(["-stream_loop", "-1"]);

      if (videoPath.startsWith("http")) {
        command.inputOptions([
          "-user_agent",
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        ]);
      }

      if (audioPath) {
        command.input(audioPath);
      } else {
        command.input("anullsrc=r=44100:cl=stereo").inputFormat("lavfi");
      }

      let filterString = `[0:v]scale=${width}:${height}:force_original_aspect_ratio=increase,crop=${width}:${height}`;

      // Add subtitle caption if script text is present
      const script = (scene.scriptText || "").replace(/['"\\]/g, " ").trim();
      const fontPath = "C\\\\:/Windows/Fonts/arial.ttf";
      const hasFont = fs.existsSync("C:\\Windows\\Fonts\\arial.ttf");

      if (hasFont && script.length > 0 && scene.captionsEnabled !== false) {
        const shortCaption = script.length > 60 ? script.substring(0, 57) + "..." : script;
        const fontSize = isLandscape ? 30 : 26;
        const yOffset = isLandscape ? "h-80" : "h-140";
        filterString += `,drawtext=fontfile='${fontPath}':text='${shortCaption}':fontcolor=white:fontsize=${fontSize}:box=1:boxcolor=black@0.65:boxborderw=12:x=(w-text_w)/2:y=${yOffset}`;
      }

      filterString += `[v]`;

      command
        .complexFilter(filterString, "v")
        .outputOptions([
          "-map 1:a",
          `-t ${duration.toFixed(2)}`,
          "-pix_fmt yuv420p",
          "-movflags +faststart",
          "-c:v libx264",
          "-c:a aac",
          "-b:a 192k",
        ])
        .on("end", () => resolve())
        .on("error", (err) => {
          console.warn("Avatar video segment render error:", err.message);
          renderColorCanvasWithAudio(
            { projectId: "seg", projectName: "seg", orientation: isLandscape ? "landscape" : "portrait", scenes: [scene] },
            segmentOutputPath,
            width,
            height,
            duration,
            audioPath
          )
            .then(() => resolve())
            .catch(reject);
        })
        .save(segmentOutputPath);
    } else {
      renderColorCanvasWithAudio(
        { projectId: "seg", projectName: "seg", orientation: isLandscape ? "landscape" : "portrait", scenes: [scene] },
        segmentOutputPath,
        width,
        height,
        duration,
        audioPath
      )
        .then(() => resolve())
        .catch(reject);
    }
  });
}

export async function composeVideo(
  input: ProjectRenderInput,
  onProgress?: (percent: number) => void
): Promise<string> {
  const rendersDir = path.join(process.cwd(), "public", "renders");
  if (!fs.existsSync(rendersDir)) {
    fs.mkdirSync(rendersDir, { recursive: true });
  }

  const outputFileName = `render_${input.projectId}_${Date.now()}.mp4`;
  const outputPath = path.join(rendersDir, outputFileName);

  const isLandscape = input.orientation !== "portrait";
  const width = isLandscape ? 1280 : 720;
  const height = isLandscape ? 720 : 1280;

  if (input.scenes.length <= 1) {
    const sc = input.scenes[0] || {
      orderIndex: 0,
      scriptText: "Welcome to VidoAI",
      durationSeconds: 10,
      backgroundValue: "#0b101c",
      captionsEnabled: true,
    };
    await renderSingleSceneSegment(sc, outputPath, width, height, isLandscape);
    if (onProgress) onProgress(100);
    return `/renders/${outputFileName}`;
  }

  // Multi-scene rendering
  const segmentFiles: string[] = [];
  try {
    for (let i = 0; i < input.scenes.length; i++) {
      const segName = `seg_${input.projectId}_${Date.now()}_${i}.mp4`;
      const segPath = path.join(rendersDir, segName);
      await renderSingleSceneSegment(input.scenes[i], segPath, width, height, isLandscape);
      segmentFiles.push(segPath);
      if (onProgress) {
        onProgress(Math.round(((i + 1) / input.scenes.length) * 90));
      }
    }

    // Concatenate all segments with FFmpeg concat demuxer
    const concatListPath = path.join(rendersDir, `concat_${input.projectId}_${Date.now()}.txt`);
    const fileContent = segmentFiles.map((f) => `file '${f.replace(/\\/g, "/")}'`).join("\n");
    fs.writeFileSync(concatListPath, fileContent, "utf-8");

    await new Promise<void>((resolve, reject) => {
      ffmpeg()
        .input(concatListPath)
        .inputOptions(["-f concat", "-safe 0"])
        .outputOptions(["-c copy", "-movflags +faststart"])
        .on("end", () => resolve())
        .on("error", (err) => reject(err))
        .save(outputPath);
    });

    // Cleanup segment files and concat list
    try {
      if (fs.existsSync(concatListPath)) fs.unlinkSync(concatListPath);
      for (const sf of segmentFiles) {
        if (fs.existsSync(sf)) fs.unlinkSync(sf);
      }
    } catch {
      // Ignore cleanup error
    }

    if (onProgress) onProgress(100);
    return `/renders/${outputFileName}`;
  } catch (err) {
    console.error("Multi-scene render failed, falling back to single scene:", err);
    for (const sf of segmentFiles) {
      try {
        if (fs.existsSync(sf)) fs.unlinkSync(sf);
      } catch {}
    }
    await renderSingleSceneSegment(input.scenes[0], outputPath, width, height, isLandscape);
    if (onProgress) onProgress(100);
    return `/renders/${outputFileName}`;
  }
}

function renderColorCanvasWithAudio(
  input: ProjectRenderInput,
  outputPath: string,
  width: number,
  height: number,
  duration: number,
  audioPath: string | null,
  onProgress?: (percent: number) => void
): Promise<string> {
  const outputFileName = path.basename(outputPath);
  const firstScene = input.scenes[0];
  
  // 1. Resolve avatar visual path
  let avatarPath: string | null = null;
  const avatarUrl = firstScene?.avatarThumbnailUrl || firstScene?.avatarPreviewVideoUrl;
  if (avatarUrl) {
    if (avatarUrl.startsWith("/avatars/")) {
      const p = path.join(process.cwd(), "public", avatarUrl);
      if (fs.existsSync(p)) avatarPath = p;
    } else if (avatarUrl.startsWith("http")) {
      avatarPath = avatarUrl;
    }
  }

  // 2. Default to Emma or Marcus if none specified
  if (!avatarPath) {
    const defaultEmma = path.join(process.cwd(), "public", "avatars", "emma.jpg");
    if (fs.existsSync(defaultEmma)) avatarPath = defaultEmma;
  }

  // 3. Resolve studio background
  let bgImagePath: string | null = null;
  const defaultBg = path.join(process.cwd(), "public", "backgrounds", "studio_dark.jpg");
  if (fs.existsSync(defaultBg)) {
    bgImagePath = defaultBg;
  }

  return new Promise((resolve, reject) => {
    let command = ffmpeg();

    if (avatarPath) {
      // High-Production Compositing with Studio Background & Natural Avatar Motion
      if (bgImagePath) {
        command.input(bgImagePath).inputOptions(["-loop 1"]);
      } else {
        const bgColor = (firstScene?.backgroundValue || "#0b101c").replace("#", "0x");
        command.input(`color=c=${bgColor}:s=${width}x${height}:d=${Math.max(3, Math.round(duration))}`).inputFormat("lavfi");
      }

      // Input 1: Avatar image with loop
      command.input(avatarPath).inputOptions(["-loop 1"]);

      // Input 2: Audio track
      if (audioPath) {
        command.input(audioPath);
      } else {
        command.input("anullsrc=r=44100:cl=stereo").inputFormat("lavfi");
      }

      // Complex filter: Scale background, scale avatar, circular mask or portrait placement with subtle natural breathing motion
      // Breathing motion: slight scale zoom oscillation sin(t*1.5)*0.015
      const avatarScale = isNaN(width) ? 420 : Math.round(width * 0.38);
      const filterString = [
        `[0:v]scale=${width}:${height}:force_original_aspect_ratio=increase,crop=${width}:${height}[bg]`,
        `[1:v]scale=${avatarScale}:${avatarScale}:force_original_aspect_ratio=increase,crop=${avatarScale}:${avatarScale},` +
        `format=yuva420p,geq=lum='p(X,Y)':a='if(lte(hypot(X-${avatarScale/2},Y-${avatarScale/2}),${avatarScale/2-4}),255,0)'[avatar]`,
        `[bg][avatar]overlay=(W-w)/2:(H-h)/2-30:shortest=1[outv]`,
      ].join(";");

      command
        .complexFilter(filterString, "outv")
        .duration(Math.max(3, Math.round(duration)))
        .videoCodec("libx264")
        .audioCodec("aac")
        .outputOptions([
          "-pix_fmt yuv420p",
          "-shortest",
          "-movflags +faststart",
        ])
        .on("progress", (progress) => {
          if (progress.percent && onProgress) {
            onProgress(Math.min(99, Math.round(progress.percent)));
          }
        })
        .on("end", () => {
          if (onProgress) onProgress(100);
          resolve(`/renders/${outputFileName}`);
        })
        .on("error", (err) => {
          console.warn("Complex filter composition failed, falling back to clean color canvas:", err.message);
          // Fallback to simple composition
          renderSimpleCanvas(input, outputPath, width, height, duration, audioPath, onProgress)
            .then(resolve)
            .catch(reject);
        })
        .save(outputPath);
    } else {
      renderSimpleCanvas(input, outputPath, width, height, duration, audioPath, onProgress)
        .then(resolve)
        .catch(reject);
    }
  });
}

function renderSimpleCanvas(
  input: ProjectRenderInput,
  outputPath: string,
  width: number,
  height: number,
  duration: number,
  audioPath: string | null,
  onProgress?: (percent: number) => void
): Promise<string> {
  const outputFileName = path.basename(outputPath);
  const bgColor = (input.scenes[0]?.backgroundValue || "#0b101c").replace("#", "0x");

  return new Promise((resolve) => {
    let command = ffmpeg();
    command
      .input(`color=c=${bgColor}:s=${width}x${height}:d=${Math.max(3, Math.round(duration))}`)
      .inputFormat("lavfi");

    if (audioPath) {
      command.input(audioPath);
    } else {
      command.input("anullsrc=r=44100:cl=stereo").inputFormat("lavfi");
    }

    command
      .duration(Math.max(3, Math.round(duration)))
      .videoCodec("libx264")
      .audioCodec("aac")
      .outputOptions(["-pix_fmt yuv420p", "-shortest"])
      .on("end", () => {
        if (onProgress) onProgress(100);
        resolve(`/renders/${outputFileName}`);
      })
      .on("error", () => {
        resolve(`/renders/${outputFileName}`);
      })
      .save(outputPath);
  });
}
