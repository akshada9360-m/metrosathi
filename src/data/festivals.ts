import type { FestivalEvent } from '../types/community'

export const festivalEvents: FestivalEvent[] = [
  {
    id: 'ganpati',
    name: 'Ganpati visit · sample event',
    destination: 'Sample festival venue',
    description: 'Configurable demo destination; no official event venue or advisory is connected.',
    candidateStationIds: ['civil-court', 'deccan-gymkhana', 'vanaz'],
    sampleWalkingDistances: {
      'civil-court': 850,
      'deccan-gymkhana': 1250,
      vanaz: 2400,
    },
    sampleCrowdLevels: {
      'civil-court': 'moderate',
      'deccan-gymkhana': 'low',
      vanaz: 'high',
    },
  },
  {
    id: 'navratri',
    name: 'Navratri visit · sample event',
    destination: 'Sample community venue',
    description: 'Configurable demo destination; crowd comparison is simulated, not predictive.',
    candidateStationIds: ['vanaz', 'deccan-gymkhana', 'civil-court'],
    sampleWalkingDistances: {
      'vanaz': 700,
      'deccan-gymkhana': 1100,
      'civil-court': 1900,
    },
    sampleCrowdLevels: {
      'vanaz': 'low',
      'deccan-gymkhana': 'moderate',
      'civil-court': 'high',
    },
  },
]
