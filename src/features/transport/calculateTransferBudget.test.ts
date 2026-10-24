import { describe, expect, it } from 'vitest'
import { busRoutes, busStops } from '../../data/busConnections'
import { calculateTransferBudget } from './calculateTransferBudget'

describe('calculateTransferBudget', () => {
  const stop = busStops.find((item) => item.id === 'demo-civil-court-east-stop')!
  const route = busRoutes.find((item) => item.id === 'demo-bus-101')!

  it('shows each transfer assumption and total duration', () => {
    const result = calculateTransferBudget({
      arrivalAtStationTime: '08:00',
      walkingDistanceMeters: stop.walkDistanceFromExitMeters,
      departures: route.departures,
      busJourneyMinutes: route.journeyMinutes,
    })
    expect(result).toMatchObject({
      stationExitMinutes: 3,
      walkToStopMinutes: 4,
      boardingBufferMinutes: 5,
      readyForBusAt: '08:12',
      nextDeparture: '08:15',
      waitMinutes: 3,
      totalMinutes: 37,
      connectionTight: true,
    })
  })

  it('rejects malformed or non-positive transfer inputs', () => {
    expect(calculateTransferBudget({
      arrivalAtStationTime: 'not a time',
      walkingDistanceMeters: 240,
      departures: route.departures,
      busJourneyMinutes: 20,
    })).toBeUndefined()
    expect(calculateTransferBudget({
      arrivalAtStationTime: '08:00',
      walkingDistanceMeters: 240,
      departures: route.departures,
      busJourneyMinutes: 20,
      walkingSpeedMetersPerMinute: 0,
    })).toBeUndefined()
  })

  it('does not treat live arrivals as locally scheduled departures', () => {
    expect(calculateTransferBudget({
      arrivalAtStationTime: '08:00',
      walkingDistanceMeters: 0,
      departures: [{ time: '08:30', dataType: 'live' }],
      busJourneyMinutes: 10,
    })).toBeUndefined()
  })
})
