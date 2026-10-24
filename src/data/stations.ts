import type { Amenity, MetroStation, StationExit } from '../types/station'

const stationPlaces: Omit<MetroStation, 'exits'>[] = [
  {
    id: 'civil-court',
    name: 'Civil Court',
    line: 'Purple & Aqua Line',
    area: 'Shivajinagar',
    description: 'A central interchange in the heart of Pune.',
    amenities: [
      {
        id: 'demo-city-care',
        name: 'City Care Clinic',
        category: 'Health',
        distanceMeters: 450,
        walkMinutes: 6,
        description: 'Sample neighbourhood listing',
      },
      {
        id: 'demo-riverfront-cafe',
        name: 'Riverfront Cafe',
        category: 'Food',
        distanceMeters: 600,
        walkMinutes: 8,
        description: 'Sample neighbourhood listing',
      },
      {
        id: 'demo-central-bus',
        name: 'Central Bus Stop',
        category: 'Transport',
        distanceMeters: 750,
        walkMinutes: 10,
        description: 'Sample neighbourhood listing',
      },
      {
        id: 'demo-reading-room',
        name: 'Shivajinagar Reading Room',
        category: 'Education',
        distanceMeters: 900,
        walkMinutes: 12,
        description: 'Sample neighbourhood listing',
      },
    ],
  },
  {
    id: 'deccan-gymkhana',
    name: 'Deccan Gymkhana',
    line: 'Aqua Line',
    area: 'Deccan',
    description: 'A convenient stop for the Deccan neighbourhood.',
    amenities: [
      {
        id: 'demo-deccan-pharmacy',
        name: 'Deccan Pharmacy',
        category: 'Health',
        distanceMeters: 350,
        walkMinutes: 5,
        description: 'Sample neighbourhood listing',
      },
      {
        id: 'demo-college-square',
        name: 'College Square',
        category: 'Education',
        distanceMeters: 700,
        walkMinutes: 9,
        description: 'Sample neighbourhood listing',
      },
      {
        id: 'demo-market-cafe',
        name: 'Market Lane Cafe',
        category: 'Food',
        distanceMeters: 500,
        walkMinutes: 7,
        description: 'Sample neighbourhood listing',
      },
      {
        id: 'demo-deccan-atm',
        name: 'Deccan ATM',
        category: 'Essentials',
        distanceMeters: 800,
        walkMinutes: 11,
        description: 'Sample neighbourhood listing',
      },
    ],
  },
  {
    id: 'vanaz',
    name: 'Vanaz',
    line: 'Aqua Line',
    area: 'Kothrud',
    description: 'A neighbourhood stop at the western end of the line.',
    amenities: [
      {
        id: 'demo-kothrud-clinic',
        name: 'Kothrud Family Clinic',
        category: 'Health',
        distanceMeters: 550,
        walkMinutes: 7,
        description: 'Sample neighbourhood listing',
      },
      {
        id: 'demo-vanaz-bus',
        name: 'Vanaz Bus Stop',
        category: 'Transport',
        distanceMeters: 300,
        walkMinutes: 4,
        description: 'Sample neighbourhood listing',
      },
      {
        id: 'demo-hilltop-eatery',
        name: 'Hilltop Eatery',
        category: 'Food',
        distanceMeters: 650,
        walkMinutes: 9,
        description: 'Sample neighbourhood listing',
      },
      {
        id: 'demo-kothrud-library',
        name: 'Kothrud Community Library',
        category: 'Education',
        distanceMeters: 950,
        walkMinutes: 13,
        description: 'Sample neighbourhood listing',
      },
    ],
  },
]

const exitConfigs: Record<string, (Omit<StationExit, 'destinationRoutes'> & {
  destinationDistances: Record<string, number>
})[]> = {
  'civil-court': [
    {
      id: 'civil-court-exit-a',
      label: 'Exit A · sample west exit',
      status: 'unknown',
      stepFree: true,
      stairsPresent: false,
      liftAvailable: true,
      rampAvailable: 'unknown',
      destinationDistances: {
        'demo-city-care': 420,
        'demo-riverfront-cafe': 720,
        'demo-central-bus': 840,
        'demo-reading-room': 980,
      },
    },
    {
      id: 'civil-court-exit-b',
      label: 'Exit B · sample east exit',
      status: 'unknown',
      stepFree: 'unknown',
      stairsPresent: true,
      liftAvailable: 'unknown',
      rampAvailable: 'unknown',
      destinationDistances: {
        'demo-city-care': 560,
        'demo-riverfront-cafe': 540,
        'demo-central-bus': 610,
        'demo-reading-room': 790,
      },
    },
  ],
  'deccan-gymkhana': [
    {
      id: 'deccan-exit-a',
      label: 'Exit A · sample north exit',
      status: 'unknown',
      stepFree: true,
      stairsPresent: false,
      liftAvailable: 'unknown',
      rampAvailable: true,
      destinationDistances: {
        'demo-deccan-pharmacy': 330,
        'demo-college-square': 690,
        'demo-market-cafe': 530,
        'demo-deccan-atm': 790,
      },
    },
    {
      id: 'deccan-exit-b',
      label: 'Exit B · sample south exit',
      status: 'unknown',
      stepFree: 'unknown',
      stairsPresent: true,
      liftAvailable: true,
      rampAvailable: 'unknown',
      destinationDistances: {
        'demo-deccan-pharmacy': 430,
        'demo-college-square': 640,
        'demo-market-cafe': 470,
        'demo-deccan-atm': 710,
      },
    },
  ],
  vanaz: [
    {
      id: 'vanaz-exit-a',
      label: 'Exit A · sample north exit',
      status: 'unknown',
      stepFree: true,
      stairsPresent: false,
      liftAvailable: true,
      rampAvailable: 'unknown',
      destinationDistances: {
        'demo-kothrud-clinic': 610,
        'demo-vanaz-bus': 360,
        'demo-hilltop-eatery': 760,
        'demo-kothrud-library': 1040,
      },
    },
    {
      id: 'vanaz-exit-b',
      label: 'Exit B · sample south exit',
      status: 'unknown',
      stepFree: 'unknown',
      stairsPresent: true,
      liftAvailable: 'unknown',
      rampAvailable: 'unknown',
      destinationDistances: {
        'demo-kothrud-clinic': 570,
        'demo-vanaz-bus': 300,
        'demo-hilltop-eatery': 650,
        'demo-kothrud-library': 920,
      },
    },
  ],
}

function createDemoExits(amenities: Amenity[], stationId: string): StationExit[] {
  const placesById = new Map(amenities.map((amenity) => [amenity.id, amenity]))

  return (exitConfigs[stationId] ?? []).map(({ destinationDistances, ...exit }) => ({
    ...exit,
    destinationRoutes: Object.entries(destinationDistances).flatMap(([amenityId, distance]) => {
      const place = placesById.get(amenityId)
      if (!place) return []

      return [{
        amenityId,
        walkingDistanceMeters: distance,
        steps: [
          `Follow station signs toward ${exit.label.split(' · ')[0]}.`,
          `Leave the station through ${exit.label.split(' · ')[0]}.`,
          `Continue toward ${place.name} for approximately ${distance} metres.`,
        ],
      }]
    }),
  }))
}

export const stations: MetroStation[] = stationPlaces.map((station) => ({
  ...station,
  exits: createDemoExits(station.amenities, station.id),
}))
