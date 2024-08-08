export function castItem<T=any, Q=any>(item: T): Q {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return item as Q;
}


