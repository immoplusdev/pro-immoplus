export function mergeObjects<T, Q>(baseObject: T, destinationObject: Q): Q {
  return { ...baseObject, destinationObject } as Q;
}
