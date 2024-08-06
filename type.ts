export type Dataset = {
  "name": string,
  "emission": number,
  "reportedDate": string,
  "category": string,
  "market": string
}

export type AggregatedDataset = {
  "market": string,
  year: number,
  totalEmission: number
}

export type MarketBasedEmissionByYear = Pick<AggregatedDataset, "market" | "year"> & {
  emissionPercentage: number
}
