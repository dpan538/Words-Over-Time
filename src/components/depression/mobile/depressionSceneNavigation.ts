export function sceneTraversal(origin: number, candidate: number, sceneCount: number) {
  if (!Number.isInteger(origin) || !Number.isInteger(candidate) || !Number.isInteger(sceneCount) || sceneCount < 1) {
    throw new TypeError("Scene navigation requires integer indices and a positive scene count.");
  }
  const boundedOrigin = Math.min(sceneCount - 1, Math.max(0, origin));
  const boundedCandidate = Math.min(sceneCount - 1, Math.max(0, candidate));
  const direction = Math.sign(boundedCandidate - boundedOrigin);
  const traversal = [boundedOrigin];

  for (let index = boundedOrigin + direction; direction !== 0 && (direction > 0 ? index <= boundedCandidate : index >= boundedCandidate); index += direction) {
    traversal.push(index);
  }

  return traversal;
}
