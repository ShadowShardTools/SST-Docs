export function resolveAgainstProjectRoot(candidate: string): string {
  throw new Error(
    `resolveAgainstProjectRoot("${candidate}") is only available in Node.js where project roots can be resolved.`,
  );
}
