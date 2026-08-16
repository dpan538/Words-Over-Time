export const MOTION_PLAYBACK_RATE = 0.7;
export const MOTION_DURATION_SCALE = 1 / MOTION_PLAYBACK_RATE;
export const CANVAS_DRIFT_RATE = MOTION_PLAYBACK_RATE;
export const IMMEDIATE_FEEDBACK_SECONDS = 0.16;

export function motionTime(seconds: number) {
  return seconds * MOTION_DURATION_SCALE;
}

export function motionMilliseconds(milliseconds: number) {
  return milliseconds * MOTION_DURATION_SCALE;
}
