
export interface ExitBusLink {
  id: string;
  stationId: string;
  exitId: string;
  exitName: string;
  busStopId: string;
  busStopName: string;
  walkingMinutes: number | null;
  walkingDirections: string;
  verificationStatus: "verified" | "unverified";
  source: string;
}

export const exitBusLinks: ExitBusLink[] = [
  {
    id: "civil-court-exit-bus-001",
    stationId: "civil-court",
    exitId: "REPLACE_WITH_REAL_EXIT_ID",
    exitName: "REPLACE_WITH_VERIFIED_EXIT_NAME",
    busStopId: "5785",
    busStopName: "REPLACE_WITH_VERIFIED_STOP_NAME",
    walkingMinutes: null,
    walkingDirections: "Add verified walking directions",
    verificationStatus: "unverified",
    source: "Needs verification",
  },
];
