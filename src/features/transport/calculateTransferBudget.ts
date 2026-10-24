import type { BusDeparture } from '../../types/station'

export interface TransferBudgetInput {
  arrivalAtStationTime: string
  walkingDistanceMeters: number
  departures: BusDeparture[]
  busJourneyMinutes: number
  stationExitMinutes?: number
  boardingBufferMinutes?: number
  walkingSpeedMetersPerMinute?: number
}

export interface TransferBudget {
  stationExitMinutes: number
  walkToStopMinutes: number
  boardingBufferMinutes: number
  readyForBusAt: string
  nextDeparture: string
  waitMinutes: number
  busJourneyMinutes: number
  totalMinutes: number
  connectionTight: boolean
}

function toMinutes(time: string): number | undefined {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(time)
  if (!match) return undefined
  return Number(match[1]) * 60 + Number(match[2])
}

function formatMinutes(minutes: number): string {
  const normalized = minutes % (24 * 60)
  return `${String(Math.floor(normalized / 60)).padStart(2, '0')}:${String(normalized % 60).padStart(2, '0')}`
}

export function calculateTransferBudget(input: TransferBudgetInput): TransferBudget | undefined {
  const arrival = toMinutes(input.arrivalAtStationTime)
  if (arrival === undefined || input.walkingDistanceMeters < 0 || input.busJourneyMinutes < 0) {
    return undefined
  }

  const speed = input.walkingSpeedMetersPerMinute ?? 75
  const stationExitMinutes = input.stationExitMinutes ?? 3
  const boardingBufferMinutes = input.boardingBufferMinutes ?? 5
  if (speed <= 0 || stationExitMinutes < 0 || boardingBufferMinutes < 0) return undefined

  const walkToStopMinutes = Math.ceil(input.walkingDistanceMeters / speed)
  const readyTime = arrival + stationExitMinutes + walkToStopMinutes + boardingBufferMinutes
  const departureMinutes = input.departures
    .filter((departure) => departure.dataType !== 'live')
    .map((departure) => toMinutes(departure.time))
    .filter((time): time is number => time !== undefined)
    .sort((first, second) => first - second)
  const nextDepartureTime = departureMinutes.find((departure) => departure >= readyTime)
  if (nextDepartureTime === undefined) return undefined

  const waitMinutes = nextDepartureTime - readyTime

  return {
    stationExitMinutes,
    walkToStopMinutes,
    boardingBufferMinutes,
    readyForBusAt: formatMinutes(readyTime),
    nextDeparture: formatMinutes(nextDepartureTime),
    waitMinutes,
    busJourneyMinutes: input.busJourneyMinutes,
    totalMinutes: stationExitMinutes + walkToStopMinutes + boardingBufferMinutes
      + waitMinutes + input.busJourneyMinutes,
    connectionTight: waitMinutes < 5,
  }
}
