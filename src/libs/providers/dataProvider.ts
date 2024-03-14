import dataProvider from "@refinedev/simple-rest";

export function getDataProvider(url: string) {
  return dataProvider(url);
}
