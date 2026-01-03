export function createInstanceOf<T>(
  type: new (...args: any[]) => T,
  ...args: any[]
): T {
  return new type(...args);
}
