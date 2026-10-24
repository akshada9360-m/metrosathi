import { describe, expect, it } from 'vitest'
import { stations } from '../../data/stations'
import { rankExits } from './rankExits'

describe('rankExits', () => {
  const station = stations.find((item) => item.id === 'civil-court')!
  const clinic = station.amenities.find((place) => place.category === 'Health')!
  const noPreferences = {
    stepFree: false,
    fewerStairs: false,
    shorterWalk: false,
    preferLiftRamp: false,
  }

  it('ranks the shorter sample route first by default', () => {
    const ranked = rankExits(station.exits, clinic, noPreferences)
    expect(ranked[0].exit.id).toBe('civil-court-exit-a')
    expect(ranked[0].walkingDistanceMeters).toBe(420)
  })

  it('changes ranking when step-free access is preferred', () => {
    const cafe = station.amenities.find((place) => place.category === 'Food')!
    const ranked = rankExits(station.exits, cafe, {
      ...noPreferences,
      stepFree: true,
    })
    expect(ranked[0].exit.id).toBe('civil-court-exit-a')
    expect(ranked[0].reasons.join(' ')).toContain('Step-free access is marked available')
  })

  it('excludes closed exits and retains unknown accessibility details', () => {
    const ranked = rankExits(
      station.exits.map((exit) => exit.id === 'civil-court-exit-a' ? { ...exit, status: 'closed' as const } : exit),
      clinic,
      noPreferences,
    )
    expect(ranked.some((result) => result.exit.status === 'closed')).toBe(false)
    expect(ranked[0].stepFreeLabel).toBe('Step-free unknown')
  })
})
