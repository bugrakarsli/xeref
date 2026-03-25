# Remotion Patterns for Podcast Video

Quick-reference code snippets for the podcast-video pipeline.

## Audio Component

```tsx
import { Audio } from '@remotion/media';
import { staticFile, interpolate } from 'remotion';

// Basic audio playback
<Audio src={staticFile('audio/podcast.wav')} />

// Volume fade-in over 1 second
<Audio
  src={staticFile('audio/podcast.wav')}
  volume={(f) => interpolate(f, [0, 30], [0, 1], { extrapolateRight: 'clamp' })}
/>
```

## Image/Slide Display

```tsx
import { Img, staticFile } from 'remotion';

<Img
  src={staticFile('slides/slide-01.jpg')}
  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
/>
```

## Dynamic Duration via Audio Length

```tsx
import { CalculateMetadataFunction, staticFile } from 'remotion';
import { getAudioDurationInSeconds } from '@remotion/media-utils';

export const calculatePodcastMetadata: CalculateMetadataFunction<Props> = async ({
  props,
}) => {
  const duration = await getAudioDurationInSeconds(staticFile(props.audioFile));
  return { durationInFrames: Math.ceil(duration * 30) };
};
```

## Sequence-Based Slide Transitions

```tsx
import { Sequence, AbsoluteFill, Img, staticFile } from 'remotion';

// slideTimings: Array<{ startFrame: number; durationFrames: number }>
{slideTimings.map((timing, i) => (
  <Sequence key={i} from={timing.startFrame} durationInFrames={timing.durationFrames}>
    <AbsoluteFill>
      <Img
        src={staticFile(`slides/slide-${String(i + 1).padStart(2, '0')}.jpg`)}
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
      />
    </AbsoluteFill>
  </Sequence>
))}
```

## Fade Transitions Between Slides

```tsx
import { interpolate, useCurrentFrame } from 'remotion';

const frame = useCurrentFrame();
const opacity = interpolate(
  frame,
  [0, 10, durationInFrames - 10, durationInFrames],
  [0, 1, 1, 0],
  { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
);
```

## CLI Render Command

```bash
# 720p render (prevents OOM)
npx remotion render src/index.ts PodcastVideo out/podcast.mp4 \
  --width 1280 --height 720

# Audio-only export
npx remotion render src/index.ts PodcastVideo out/audio.mp3
```
