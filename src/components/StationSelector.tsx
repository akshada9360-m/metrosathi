import type { MetroStation } from '../types/station'

interface StationSelectorProps {
  stations: MetroStation[]
  selectedStationId: string
  onSelect: (stationId: string) => void
}

export function StationSelector({
  stations,
  selectedStationId,
  onSelect,
}: StationSelectorProps) {
  return (
    <label className="station-select-wrap">
      <span className="station-pin" aria-hidden="true">⌖</span>
      <span className="sr-only">Choose a metro station</span>
      <select
        className="station-select"
        value={selectedStationId}
        onChange={(event) => onSelect(event.target.value)}
      >
        {stations.map((station) => (
          <option key={station.id} value={station.id}>
            {station.name} · {station.area}
          </option>
        ))}
      </select>
      <span className="select-chevron" aria-hidden="true">⌄</span>
    </label>
  )
}
