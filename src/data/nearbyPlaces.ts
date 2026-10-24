
export type NearbyPlaceCategory =
  | "hospital"
  | "atm"
  | "hotspot"
  | "market"
  | "food"
  | "pharmacy"
  | "other";

export interface NearbyPlace {
  id: string;
  stationId: string;
  name: string;
  category: NearbyPlaceCategory;
  area: string;
  address: string;
  walkingMinutes: number | null;
  distanceMeters: number | null;
  description: string;
  sourceUrl: string;
  verificationStatus: "verified" | "unverified";
}

export const nearbyPlaces: NearbyPlace[] = [
  {
    id: "deccan-sahyadri-hospital",
    stationId: "deccan-gymkhana",
    name: "Sahyadri Super Speciality Hospital",
    category: "hospital",
    area: "Deccan Gymkhana",
    address: "Plot No. 30-C, Karve Road, Pune",
    walkingMinutes: null,
    distanceMeters: null,
    description: "Multispeciality hospital",
    sourceUrl: "https://www.sahyadrihospital.com/",
    verificationStatus: "unverified",
  },
  {
    id: "deccan-fc-road",
    stationId: "deccan-gymkhana",
    name: "Fergusson College Road (FC Road) area",
    category: "hotspot",
    area: "Deccan",
    address: "FC Road, Pune",
    walkingMinutes: null,
    distanceMeters: null,
    description: "Popular commercial, shopping and food area",
    sourceUrl: "https://www.google.com/maps/search/FC+Road+Pune/",
    verificationStatus: "unverified",
  },
  {
    id: "civil-court-kamla-nehru",
    stationId: "civil-court",
    name: "Kamla Nehru Hospital",
    category: "hospital",
    area: "Mangalwar Peth",
    address: "Mangalwar Peth Road, Pune",
    walkingMinutes: null,
    distanceMeters: null,
    description: "Municipal general hospital",
    sourceUrl: "https://www.google.com/maps/search/Kamla+Nehru+Hospital+Pune/",
    verificationStatus: "unverified",
  },
  {
    id: "civil-court-hdfc-atm",
    stationId: "civil-court",
    name: "HDFC Bank ATM",
    category: "atm",
    area: "Kasba Peth",
    address: "Survey No. 848, Kasba Peth, Pune",
    walkingMinutes: null,
    distanceMeters: null,
    description: "ATM location; exact station proximity needs checking",
    sourceUrl: "https://www.google.com/maps/search/ATM+near+Civil+Court+Metro+Station+Pune/",
    verificationStatus: "unverified",
  },
];
