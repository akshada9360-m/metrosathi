export type CommunityReportType = 'crowd' | 'lift' | 'blocked_path' | 'bus_stop_change' | 'other'

export interface CommunityReport {
  id: string
  stationId: string
  area: string
  type: CommunityReportType
  note: string
  createdAt: string
  status: 'unverified' | 'confirmed' | 'expired'
}

export type FestivalId = 'ganpati' | 'navratri'

export interface FestivalEvent {
  id: FestivalId
  name: string
  destination: string
  description: string
  candidateStationIds: string[]
  sampleWalkingDistances: Record<string, number>
  sampleCrowdLevels: Record<string, 'low' | 'moderate' | 'high'>
}

export interface UserPreferences {
  language: 'en' | 'hi' | 'mr'
  largeText: boolean
  reducedWalking: boolean
  stepFree: boolean
}
