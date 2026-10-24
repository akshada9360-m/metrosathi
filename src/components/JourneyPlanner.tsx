import { useMemo, useState } from 'react'
import type { AmenityCategory, MetroStation } from '../types/station'
import { rankExits, type JourneyPreferences } from '../features/journey/rankExits'
import './JourneyPlanner.css'

const categories: ('All places' | AmenityCategory)[] = [
  'All places',
  'Health',
  'Education',
  'Food',
  'Transport',
  'Essentials',
]

const defaultPreferences: JourneyPreferences = {
  stepFree: false,
  fewerStairs: false,
  shorterWalk: false,
  preferLiftRamp: false,
}

interface JourneyPlannerProps {
  station: MetroStation
  initialPreferences?: JourneyPreferences
}

export function JourneyPlanner({ station, initialPreferences = defaultPreferences }: JourneyPlannerProps) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<'All places' | AmenityCategory>('All places')
  const [destinationId, setDestinationId] = useState(station.amenities[0]?.id ?? '')
  const [preferences, setPreferences] = useState(initialPreferences)
  const normalizedQuery = query.trim().toLowerCase()
  const destinations = useMemo(
    () => station.amenities
      .filter((place) => category === 'All places' || place.category === category)
      .filter((place) => !normalizedQuery || place.name.toLowerCase().includes(normalizedQuery)),
    [category, normalizedQuery, station.amenities],
  )
  const destination = station.amenities.find((place) => place.id === destinationId)
  const results = destination
    ? rankExits(station.exits, destination, preferences)
    : []

  const setPreference = (key: keyof JourneyPreferences, value: boolean) => {
    setPreferences((current) => ({ ...current, [key]: value }))
  }

  return (
    <div className="journey-planner">
      <section className="panel planner-form">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">EXIT GUIDANCE · DEMO DATA</p>
            <h2>Where are you heading?</h2>
          </div>
          <span className="planner-compass" aria-hidden="true">⌖</span>
        </div>
        <p className="planner-description">
          Choose a sample nearby place and tell us what matters for your walk.
        </p>

        <label className="search-field planner-search">
          <span aria-hidden="true">⌕</span>
          <input
            type="search"
            aria-label="Search destinations"
            placeholder="Search a destination"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <div className="category-list" aria-label="Filter destinations by category">
          {categories.map((item) => (
            <button
              key={item}
              className={`category-chip ${category === item ? 'selected' : ''}`}
              onClick={() => setCategory(item)}
              aria-pressed={category === item}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="destination-options" role="group" aria-label="Choose a destination">
          {destinations.length > 0 ? destinations.map((place) => (
            <button
              className={`destination-option ${destinationId === place.id ? 'is-selected' : ''}`}
              key={place.id}
              onClick={() => setDestinationId(place.id)}
              aria-pressed={destinationId === place.id}
            >
              <span className="destination-radio" aria-hidden="true">
                {destinationId === place.id && <span />}
              </span>
              <span className="destination-copy">
                <strong>{place.name}</strong>
                <small>{place.category} · sample listing</small>
              </span>
              <span className="destination-distance">{place.distanceMeters} m</span>
            </button>
          )) : (
            <div className="planner-empty">
              No matching sample places. Try a different search or category.
            </div>
          )}
        </div>

        <fieldset className="preferences-fieldset">
          <legend>What would make this walk easier?</legend>
          <PreferenceToggle
            label="Step-free route"
            description="Prefer exits marked step-free"
            checked={preferences.stepFree}
            onChange={(checked) => setPreference('stepFree', checked)}
          />
          <PreferenceToggle
            label="Fewer stairs"
            description="Avoid exits where stairs are listed"
            checked={preferences.fewerStairs}
            onChange={(checked) => setPreference('fewerStairs', checked)}
          />
          <PreferenceToggle
            label="Shorter walk"
            description="Give more weight to walking distance"
            checked={preferences.shorterWalk}
            onChange={(checked) => setPreference('shorterWalk', checked)}
          />
          <PreferenceToggle
            label="Prefer a lift or ramp"
            description="Prefer exits listing either feature"
            checked={preferences.preferLiftRamp}
            onChange={(checked) => setPreference('preferLiftRamp', checked)}
          />
        </fieldset>
      </section>

      <section className="planner-results" aria-live="polite">
        <div className="results-heading">
          <div>
            <p className="eyebrow">RECOMMENDED EXIT</p>
            <h2>{destination ? `To ${destination.name}` : 'Choose a destination'}</h2>
          </div>
          {destination && <span className="demo-tag">SAMPLE ROUTE</span>}
        </div>

        {!destination ? (
          <div className="panel planner-empty-state">
            <strong>No destination selected</strong>
            <p>Choose a destination above to compare the sample exits.</p>
          </div>
        ) : results.length > 0 ? (
          <>
            <RouteSchematic
              stationName={station.name}
              exitName={results[0].exit.label}
              destinationName={destination.name}
            />
            {preferences.stepFree && results[0].exit.stepFree !== true && (
              <div className="accessibility-warning" role="status">
                <strong>Step-free access cannot be verified for the top-ranked exit.</strong>
                <span>
                  {results.some((result) => result.exit.stepFree === true)
                    ? 'A different exit is marked step-free in this demo dataset; compare the options below.'
                    : 'No step-free exit is confirmed in this demo dataset. Check station signage or ask station staff before relying on this route.'}
                </span>
              </div>
            )}
            <ol className="exit-results">
              {results.map((result, index) => (
                <li className={`exit-result ${index === 0 ? 'is-recommended' : ''}`} key={result.exit.id}>
                  <div className="exit-result-heading">
                    <span className="exit-rank">{index === 0 ? '★' : `${index + 1}`}</span>
                    <div className="exit-title">
                      <strong>{result.exit.label}</strong>
                      <span>{index === 0 ? 'Recommended for your preferences' : 'Alternative exit'}</span>
                    </div>
                    {index === 0 && <span className="recommended-badge">BEST MATCH</span>}
                  </div>
                  <div className="exit-metrics">
                    <span><strong>{result.walkingDistanceMeters} m</strong> estimated walk</span>
                    <span><strong>~{result.walkingMinutes} min</strong> at 75 m/min</span>
                    <span className={`step-free-badge ${result.exit.stepFree === true ? 'known-accessible' : ''}`}>
                      {result.stepFreeLabel}
                    </span>
                  </div>
                  <div className="accessibility-facts" aria-label="Sample accessibility information">
                    <span>Stairs listed: {knownValueLabel(result.exit.stairsPresent)}</span>
                    <span>Lift listed: {knownValueLabel(result.exit.liftAvailable)}</span>
                    <span>Ramp listed: {knownValueLabel(result.exit.rampAvailable)}</span>
                  </div>
                  <p className="exit-status">
                    Exit status: {result.exit.status}
                    {result.exit.status === 'unknown' && ' · no verified status feed'}
                  </p>
                  <ul className="reason-list">
                    {result.reasons.map((reason) => <li key={reason}>{reason}</li>)}
                  </ul>
                  <details className="route-details">
                    <summary>View sample walking instructions</summary>
                    <ol>
                      {result.steps.map((step, stepIndex) => <li key={`${result.exit.id}-${stepIndex}`}>{step}</li>)}
                    </ol>
                  </details>
                </li>
              ))}
            </ol>
          </>
        ) : (
          <div className="panel planner-empty-state">
            <strong>No exit guidance for this destination</strong>
            <p>This demo station has no exit-to-destination record. Check station signage or ask station staff.</p>
          </div>
        )}

        <div className="planner-caveat">
          <span aria-hidden="true">i</span>
          <p>
            Demo-only exit names, distances, accessibility notes, and directions—not official station data.
            This is exit guidance from a sample dataset, not indoor GPS navigation. Walking times are estimates;
            verify the route with station signage or staff. Step-free access is never guaranteed.
          </p>
        </div>
      </section>
    </div>
  )
}

function knownValueLabel(value: boolean | 'unknown'): string {
  return value === true ? 'Yes' : value === false ? 'No' : 'Unknown'
}

function PreferenceToggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="preference-row">
      <span>
        <strong>{label}</strong>
        <small>{description}</small>
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
    </label>
  )
}

function RouteSchematic({
  stationName,
  exitName,
  destinationName,
}: {
  stationName: string
  exitName: string
  destinationName: string
}) {
  return (
    <div className="route-schematic" aria-label={`Schematic: ${stationName} to ${destinationName} via ${exitName}`}>
      <div className="schematic-stop">
        <span className="schematic-marker station-marker" />
        <strong>{stationName}</strong>
        <small>Selected station</small>
      </div>
      <span className="schematic-track"><span>OUTSIDE STATION · NOT TO SCALE</span></span>
      <div className="schematic-stop destination-stop">
        <span className="schematic-marker destination-marker" />
        <strong>{destinationName}</strong>
        <small>Via {exitName.split(' · ')[0]}</small>
      </div>
    </div>
  )
}
