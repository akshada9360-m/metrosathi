
import { exitBusLinks } from "../data/exitBusLinks";
import { gtfsScheduledStopTimes } from "../data/gtfsScheduled";

export function getExitBusConnections(stationId: string) {
  return exitBusLinks
    .filter((link) => link.stationId === stationId)
    .map((link) => {
      const departures = gtfsScheduledStopTimes
        .filter((item) => item.stopId === link.busStopId)
        .sort((a, b) =>
          a.scheduledTime.localeCompare(b.scheduledTime)
        );

      return {
        ...link,
        departures,
      };
    });
}
