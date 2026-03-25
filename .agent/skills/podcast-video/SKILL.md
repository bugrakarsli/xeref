---
name: podcast-video
description: End-to-end pipeline for turning a YouTube URL into a Remotion-rendered podcast video. Orchestrates NotebookLM (audio + slides), Whisper (timestamps), Poppler (PDF→images), and Remotion (assembly + render). Use when user says /podcast-video, "create podcast video", "YouTube to Remotion", "NotebookLM podcast to video", or wants to convert any audio+slides into a synced video.
---

# Podcast Video Pipeline

Converts a YouTube URL into a fully rendered podcast-style video by chaining NotebookLM → Whisper → Poppler → Remotion.

## Prerequisites

| Tool | Install | Purpose |
|------|---------|---------|
| NotebookLM CLI | `pip install notebooklm-py` | Audio & slide generation |
| Whisper | `pip install openai-whisper` | Word-level timestamps |
| Poppler | `choco install poppler` (Win) / `brew install poppler` (Mac) | PDF → JPG extraction |
| Remotion | Existing project with `@remotion/cli`, `@remotion/media` | Video assembly & render |

## Pipeline (5 Steps)

### Step 1: NotebookLM — Generate Audio & Slides

> **Skill dependency:** Use the `notebooklm` skill for full CLI reference.

```bash
# 1a. Create notebook and add YouTube source
notebooklm create "Podcast: [Topic]"
notebooklm source add "https://youtube.com/watch?v=XXXXX"

# 1b. Wait for source processing
notebooklm source list --json  # Wait until status = "ready"

# 1c. Generate audio and slide deck
notebooklm generate audio "Create a deep-dive podcast overview"
notebooklm generate slide-deck --format detailed

# 1d. Wait for artifacts (use subagent pattern for non-blocking)
notebooklm artifact list --json  # Check status

# 1e. Download
notebooklm download audio ./pipeline/audio.wav
notebooklm download slide-deck ./pipeline/slides.pdf
```

**Audio format priority:** `.wav` (best fidelity for Whisper) > `.m4a` (smaller, supported)

### Step 2: Whisper — Temporal Transcription

Generate word-level timestamps with Dynamic Time Warping for precise alignment:

```bash
whisper ./pipeline/audio.wav \
  --model large-v3 \
  --dtw true \
  --output_format json \
  --output_dir ./pipeline/
```

**Output:** `pipeline/audio.json` containing word-level timestamps:
```json
{
  "segments": [
    {
      "start": 0.0, "end": 4.2,
      "text": "Welcome to today's deep dive...",
      "words": [
        {"word": "Welcome", "start": 0.0, "end": 0.4},
        {"word": "to", "start": 0.4, "end": 0.5}
      ]
    }
  ]
}
```

Rename to `whisper-timestamps.json` for clarity:
```bash
mv ./pipeline/audio.json ./pipeline/whisper-timestamps.json
```

### Step 3: Poppler — PDF to Slide Images

Extract each PDF page as a high-quality JPEG:

```bash
mkdir -p ./pipeline/slides
pdftoppm -jpeg -r 150 ./pipeline/slides.pdf ./pipeline/slides/slide
```

**Output:** `slide-01.jpg`, `slide-02.jpg`, ... in `./pipeline/slides/`

### Step 4: Remotion — Assembly & Preview

#### 4a. Copy Assets into Remotion Project

```bash
# Copy into the Remotion project's public/ folder
cp ./pipeline/audio.wav           <remotion-project>/public/audio/podcast.wav
cp ./pipeline/whisper-timestamps.json <remotion-project>/public/timestamps.json
cp ./pipeline/slides/*.jpg        <remotion-project>/public/slides/
```

#### 4b. Create the Composition

Key Remotion patterns for audio-synced slide video:

```tsx
import { Composition } from 'remotion';
import { PodcastVideo } from './PodcastVideo';
import { calculatePodcastMetadata } from './calculate-metadata';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="PodcastVideo"
      component={PodcastVideo}
      calculateMetadata={calculatePodcastMetadata}
      fps={30}
      width={1280}
      height={720}
      defaultProps={{
        audioFile: 'audio/podcast.wav',
        timestampsFile: 'timestamps.json',
      }}
    />
  </>
);
```

#### 4c. Dynamic Duration from Audio

```tsx
import { CalculateMetadataFunction, staticFile } from 'remotion';
import { getAudioDurationInSeconds } from '@remotion/media-utils';

export const calculatePodcastMetadata: CalculateMetadataFunction<Props> = async ({
  props,
}) => {
  const duration = await getAudioDurationInSeconds(
    staticFile(props.audioFile)
  );
  return {
    durationInFrames: Math.ceil(duration * 30),
  };
};
```

#### 4d. Main Video Component

```tsx
import { AbsoluteFill, Img, Sequence, staticFile } from 'remotion';
import { Audio } from '@remotion/media';

export const PodcastVideo: React.FC<Props> = ({ audioFile, timestampsFile }) => {
  // Load timestamps from public/ via fetch in useEffect or calculateMetadata
  // Map slide transitions to frame numbers using Whisper segment boundaries

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <Audio src={staticFile(audioFile)} />
      {slides.map((slide, i) => (
        <Sequence key={i} from={slide.startFrame} durationInFrames={slide.duration}>
          <AbsoluteFill>
            <Img
              src={staticFile(`slides/slide-${String(i + 1).padStart(2, '0')}.jpg`)}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </Img>
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
```

#### 4e. Preview

```bash
cd <remotion-project>
npm run dev   # Opens Remotion Studio at localhost:3000
```

Verify slide transitions sync with audio before rendering.

### Step 5: Render at 720p

> [!IMPORTANT]
> Set resolution to **1280×720** to prevent out-of-memory crashes during render.

```bash
npx remotion render src/index.ts PodcastVideo out/podcast.mp4 \
  --width 1280 \
  --height 720
```

Remotion uses its bundled FFmpeg — no external FFmpeg install needed.

## Timestamp-to-Slide Mapping Strategy

The bridge between Whisper's JSON and Remotion's `<Sequence>` components:

1. **Load** `whisper-timestamps.json` in `calculateMetadata` or a data-fetching hook
2. **Segment** the transcript into slide-sized chunks (by topic breaks or equal time slices)
3. **Convert** each segment's `start` time to frames: `Math.round(startSeconds * fps)`
4. **Render** each slide in a `<Sequence from={startFrame} durationInFrames={duration}>`

**Automatic approach:** If the number of Whisper segments ≈ number of slides, map 1:1.
**Manual approach:** Define slide change points in a separate JSON config file.

## Directory Structure (Pipeline Working Dir)

```
pipeline/
├── audio.wav                 # NotebookLM audio download
├── slides.pdf                # NotebookLM slide deck
├── whisper-timestamps.json   # Whisper DTW output
└── slides/                   # Extracted JPGs
    ├── slide-01.jpg
    ├── slide-02.jpg
    └── ...
```

## Remotion Project Asset Layout

```
<remotion-project>/public/
├── audio/
│   └── podcast.wav
├── slides/
│   ├── slide-01.jpg
│   ├── slide-02.jpg
│   └── ...
└── timestamps.json
```

## Error Handling

| Issue | Cause | Fix |
|-------|-------|-----|
| OOM during render | Resolution too high | Use `--width 1280 --height 720` |
| Whisper no DTW output | Wrong flag | Use `--dtw true` (requires `large-v3` model) |
| Slides not showing | Wrong path | Verify files exist in `public/` and use `staticFile()` |
| Audio desync | Wrong FPS | Ensure composition FPS matches the FPS used in frame calculations |
| NotebookLM rate limit | Google API throttling | Wait 5-10 min, retry |
| Poppler not found | Not installed | `choco install poppler` / `brew install poppler` |

## Checklist Before Render

- [ ] Audio plays correctly in Remotion Studio preview
- [ ] All slides display at correct times
- [ ] Transitions are smooth (no missing frames)
- [ ] Resolution set to 1280×720 in composition or CLI flags
- [ ] Output path exists and is writable
