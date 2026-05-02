export type ClientKey = "virginia" | "maryland" | "north_carolina" | "south_carolina";

export type ClientConfig = {
  key: ClientKey;
  displayName: string;
  officeTag: string;
  ghlLocationId: string;
  metaAdAccountId: string;
  revenuePerSale: number;
  feeTiagoPerSale: number;
};

export const GHL_LOCATION_ID = "EiZQnibRq2k2C21iyxmd";

export const CLIENTS: ClientConfig[] = [
  {
    key: "virginia",
    displayName: "Virginia",
    officeTag: "va leads - jorge",
    ghlLocationId: GHL_LOCATION_ID,
    metaAdAccountId: "1423143898800903",
    revenuePerSale: 3000,
    feeTiagoPerSale: 750,
  },
  {
    key: "maryland",
    displayName: "Maryland",
    officeTag: "md leads - fernando",
    ghlLocationId: GHL_LOCATION_ID,
    metaAdAccountId: "795631173072316",
    revenuePerSale: 2800,
    feeTiagoPerSale: 500,
  },
  {
    key: "north_carolina",
    displayName: "North Carolina",
    officeTag: "nc leads - danelly",
    ghlLocationId: GHL_LOCATION_ID,
    metaAdAccountId: "1482791790226418",
    revenuePerSale: 3000,
    feeTiagoPerSale: 750,
  },
  {
    key: "south_carolina",
    displayName: "South Carolina",
    officeTag: "sc leads - a&y",
    ghlLocationId: GHL_LOCATION_ID,
    metaAdAccountId: "751411627703795",
    revenuePerSale: 3000,
    feeTiagoPerSale: 750,
  },
];

export const GLOBAL_GHL_TAGS = {
  scheduled: "scheduled",
  confirmed: "confirmed",
  showed: "showed",
  english: "english",
  spanish: "spanish",
  saleClosed: "venta",
  salePaid: "pagada",
} as const;
