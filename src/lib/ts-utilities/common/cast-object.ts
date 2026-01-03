export function castObject<T=any, Q=any>(object: T): Q {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return Object.assign({}, object) as Q;
}

export function castArrayOfObjects<T=any, Q = any>(objects: T[]): Q[] {
  return objects.map((object) => castObject<T, Q>(object));
}
