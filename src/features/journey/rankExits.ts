import type { Amenity, StationExit } from '../../types/station'

export interface JourneyPreferences {
  stepFree: boolean
  fewerStairs: boolean
  shorterWalk: boolean
  preferLiftRamp: boolean
}

export interface RankedExit {
  exit: StationExit
  walkingDistanceMeters: number
  walkingMinutes: number
  steps: string[]
  score: number
  reasons: string[]
  stepFreeLabel: string
}

const walkingSpeedMetersPerMinute = 75

function walkingMinutes(distanceMeters: number): number {
  return Math.max(1, Math.ceil(distanceMeters / walkingSpeedMetersPerMinute))
}

function isKnownTrue(value: boolean | 'unknown'): boolean {
  return value === true
}

function accessibilityPenalty(value: boolean | 'unknown', preference: boolean): number {
  if (!preference) return 0
  if (value === true) return 0
  return value === false ? 2000 : 700
}

export function rankExits(
  exits: StationExit[],
  destination: Amenity,
  preferences: JourneyPreferences,
): RankedExit[] {
  return exits.flatMap((exit) => {
    const destinationRoute = exit.destinationRoutes.find(
      (route) => route.amenityId === destination.id,
    )
    if (!destinationRoute || exit.status === 'closed') return []

    const distanceScore = preferences.shorterWalk
      ? destinationRoute.walkingDistanceMeters * 2
      : destinationRoute.walkingDistanceMeters
    const stepFreePenalty = accessibilityPenalty(exit.stepFree, preferences.stepFree)
    const stairsPenalty = preferences.fewerStairs
      ? exit.stairsPresent === false ? 0 : exit.stairsPresent === true ? 500 : 250
      : 0
    const liftRampKnown = isKnownTrue(exit.liftAvailable) || isKnownTrue(exit.rampAvailable)
    const liftRampPenalty = preferences.preferLiftRamp
      ? liftRampKnown ? 0 : exit.liftAvailable === false && exit.rampAvailable === false ? 500 : 350
      : 0
    const reasons: string[] = []

    if (preferences.stepFree) {
      reasons.push(exit.stepFree === true
        ? 'Step-free access is marked available in this demo dataset.'
        : exit.stepFree === false
          ? 'Step-free access is marked unavailable in this demo dataset.'
          : 'Step-free access is unknown in this demo dataset.')
    }
    if (preferences.fewerStairs) {
      reasons.push(exit.stairsPresent === false
        ? 'No stairs are listed for this sample exit.'
        : exit.stairsPresent === true
          ? 'Stairs are listed for this sample exit.'
          : 'Stair information is unknown for this sample exit.')
    }
    if (preferences.preferLiftRamp) {
      reasons.push(liftRampKnown
        ? 'A lift or ramp is listed in this demo dataset.'
        : 'Lift and ramp availability is not confirmed in this demo dataset.')
    }
    if (preferences.shorterWalk) {
      reasons.push('Walking distance is included in the ranking.')
    }
    if (reasons.length === 0) reasons.push('Ranked by the sample walking distance to this place.')

    return [{
      exit,
      walkingDistanceMeters: destinationRoute.walkingDistanceMeters,
      walkingMinutes: walkingMinutes(destinationRoute.walkingDistanceMeters),
      steps: destinationRoute.steps,
      score: distanceScore + stepFreePenalty + stairsPenalty + liftRampPenalty,
      reasons,
      stepFreeLabel: exit.stepFree === true
        ? 'Step-free listed'
        : exit.stepFree === false
          ? 'Not step-free'
          : 'Step-free unknown',
    }]
  }).sort((first, second) => first.score - second.score)
}
