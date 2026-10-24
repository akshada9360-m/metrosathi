export type AmenityCategory =
  | 'Health'
  | 'Education'
  | 'Food'
  | 'Transport'
  | 'Essentials'

export interface Amenity {
  id: string
  name: string
  category: AmenityCategory
  distanceMeters: number
  walkMinutes: number
  description: string
}

export type KnownValue = boolean | 'unknown'

export interface ExitDestinationRoute {
  amenityId: string
  walkingDistanceMeters: number
  steps: string[]
}

export interface StationExit {
  id: string
  label: string
  status: 'open' | 'closed' | 'unknown'
  stepFree: KnownValue
  stairsPresent: KnownValue
  liftAvailable: KnownValue
  rampAvailable: KnownValue
  destinationRoutes: ExitDestinationRoute[]
}

export interface MetroStation {
  id: string
  name: string
  line: string
  area: string
  description: string
  amenities: Amenity[]
  exits: StationExit[]
}

export type DataType = 'static' | 'scheduled' | 'live' | 'estimate' | 'community' | 'demo'

export interface BusStop {
  id: string
  name: string
  nearbyStationId: string
  nearbyExitId: string
  walkDistanceFromExitMeters: number
  routeIds: string[]
  source: string
  dataType: DataType
}

export interface BusDeparture {
  time: string
  dataType: 'demo' | 'scheduled' | 'live'
}

export interface BusRoute {
  id: string
  routeNumber: string
  destination: string
  stopIds: string[]
  departures: BusDeparture[]
  journeyMinutes: number
  realtimeAvailable: boolean
  source: string
  dataType: DataType
}
