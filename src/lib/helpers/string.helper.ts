export function normalizeStringArray(item: string | string[], splitter = ",") {
    return typeof item == "string" ? item.split(splitter) : item;
}
