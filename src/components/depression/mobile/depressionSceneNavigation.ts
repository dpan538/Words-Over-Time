export function clampToAdjacentScene(origin: number, candidate: number, sceneCount: number) {
  if (!Number.isInteger(origin) || !Number.isInteger(candidate) || !Number.isInteger(sceneCount) || sceneCount < 1) {
    throw new TypeError("Scene navigation requires integer indices and a positive scene count.");
  }
  const boundedOrigin = Math.min(sceneCount - 1, Math.max(0, origin));
  const lower = Math.max(0, boundedOrigin - 1);
  const upper = Math.min(sceneCount - 1, boundedOrigin + 1);
  return Math.min(upper, Math.max(lower, candidate));
}
