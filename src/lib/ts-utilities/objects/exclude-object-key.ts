export function excludeObjectKey<T extends object, U extends keyof any>(obj: T, key: U) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [key]: _, ...newObj } = obj;
    return newObj;
}