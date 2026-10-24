
import {
  nearbyPlaces,
  type NearbyPlaceCategory,
} from "../data/nearbyPlaces";

export function getNearbyPlaces(
  stationId: string,
  category?: NearbyPlaceCategory
) {
  return nearbyPlaces.filter((place) => {
    const matchesStation = place.stationId === stationId;
    const matchesCategory =
      !category || place.category === category;

    return matchesStation && matchesCategory;
  });
}
