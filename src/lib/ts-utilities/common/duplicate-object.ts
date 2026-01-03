export function duplicateObject<T>(object: T): T {
  return Object.assign({}, object) as T;
}
