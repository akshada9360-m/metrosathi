import { useMemo, useState } from 'react'
import { busRoutes, busStops } from '../data/busConnections'
import { calculateTransferBudget } from '../features/transport/calculateTransferBudget'
import type { MetroStation } from '../types/station'
import './BusConnectionPlanner.css'

interface BusConnectionPlannerProps {
  station: MetroStation
}

export function BusConnectionPlanner({ station }: BusConnectionPlannerProps) {
  const stops = useMemo(
    () => busStops.filter((stop) => stop.nearbyStationId === station.id),
    [station.id],
  )
  const [selectedStopId, setSelectedStopId] = useState(stops[0]?.id ?? '')
  const [selectedRouteId, setSelectedRouteId] = useState('')
  const [arrivalTime, setArrivalTime] = useState('08:00')
  const selectedStop = stops.find((stop) => stop.id === selectedStopId)
  const routes = selectedStop
    ? selectedStop.routeIds.flatMap((routeId) => {
      const route = busRoutes.find((item) => item.id === routeId)
      return route ? [route] : []
    })
    : []
  const route = routes.find((item) => item.id === selectedRouteId) ?? routes[0]
  const exit = station.exits.find((item) => item.id === selectedStop?.nearbyExitId)
  const budget = selectedStop && route
    ? calculateTransferBudget({
      arrivalAtStationTime: arrivalTime,
      walkingDistanceMeters: selectedStop.walkDistanceFromExitMeters,
      departures: route.departures,
      busJourneyMinutes: route.journeyMinutes,
    })
    : undefined

  const changeStop = (stopId: string) => {
    setSelectedStopId(stopId)
    setSelectedRouteId('')
  }

  return (
    <div className="bus-planner">
      <section className="panel bus-form">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">METRO + BUS · DEMO DATA</p>
            <h2>Plan your connection</h2>
          </div>
          <span className="planner-compass" aria-hidden="true">⇄</span>
        </div>
        <p className="planner-description">
          Choose a nearby sample stop and route to estimate the last-mile transfer.
        </p>

        <label className="bus-field">
          <span>Metro station</span>
          <input value={station.name} readOnly aria-label="Selected metro station" />
        </label>
        <label className="bus-field">
          <span>Bus stop</span>
          <select
            value={selectedStop?.id ?? ''}
            onChange={(event) => changeStop(event.target.value)}
            aria-label="Choose a bus stop"
            disabled={stops.length === 0}
          >
            {stops.map((stop) => (
              <option key={stop.id} value={stop.id}>
                {stop.name} · {stop.walkDistanceFromExitMeters} m
              </option>
            ))}
          </select>
        </label>
        <label className="bus-field">
          <span>Bus route</span>
          <select
            value={route?.id ?? ''}
            onChange={(event) => setSelectedRouteId(event.target.value)}
            aria-label="Choose a bus route"
            disabled={routes.length === 0}
          >
            {routes.map((item) => (
              <option key={item.id} value={item.id}>
                {item.routeNumber} · {item.destination}
              </option>
            ))}
          </select>
        </label>
        <label className="bus-field">
          <span>Expected arrival at station</span>
          <input
            type="time"
            value={arrivalTime}
            onChange={(event) => setArrivalTime(event.target.value)}
            aria-label="Expected arrival time at station"
          />
        </label>

        {selectedStop && (
          <div className="stop-detail">
            <span className="stop-detail-icon" aria-hidden="true">⌖</span>
            <span>
              <strong>{selectedStop.name}</strong>
              <small>From {exit?.label ?? 'sample station exit'} · {selectedStop.walkDistanceFromExitMeters} m walk</small>
            </span>
          </div>
        )}
      </section>

      <section className="bus-results" aria-live="polite">
        <div className="results-heading">
          <div>
            <p className="eyebrow">TRANSFER TIME BUDGET</p>
            <h2>{route ? `Route ${route.routeNumber} · ${route.destination}` : 'No sample route available'}</h2>
          </div>
          <span className="demo-tag">SIMULATED</span>
        </div>

        {stops.length === 0 ? (
          <div className="panel planner-empty-state">
            <strong>No sample bus stops for this station</strong>
            <p>This station has no bus-connection demo data yet.</p>
          </div>
        ) : route && selectedStop && budget ? (
          <>
            <div className="bus-route-summary">
              <div className="route-number">{route.routeNumber}</div>
              <div>
                <strong>{selectedStop.name} to {route.destination}</strong>
                <span>Sample route · illustrative bus journey {route.journeyMinutes} min</span>
              </div>
              <span className="route-endpoint" aria-hidden="true">→</span>
            </div>

            <div className="transfer-timeline">
              <TimeSegment label="Exit station" value={`${budget.stationExitMinutes} min`} detail="Assumed station egress" />
              <TimeSegment label="Walk to stop" value={`${budget.walkToStopMinutes} min`} detail={`${selectedStop.walkDistanceFromExitMeters} m at 75 m/min`} />
              <TimeSegment label="Safety buffer" value={`${budget.boardingBufferMinutes} min`} detail="Planning allowance" />
              <TimeSegment label="Wait for bus" value={`${budget.waitMinutes} min`} detail={`Sample departure ${budget.nextDeparture}`} />
              <TimeSegment label="Bus journey" value={`~${budget.busJourneyMinutes} min`} detail="Illustrative route duration" />
            </div>

            <div className={`connection-total ${budget.connectionTight ? 'is-tight' : ''}`}>
              <div>
                <span>{budget.connectionTight ? 'Tight connection warning' : 'Estimated total transfer'}</span>
                <strong>~{budget.totalMinutes} min</strong>
              </div>
              <p>
                Arrive at station by {arrivalTime}. Estimated ready-at-stop time: {budget.readyForBusAt}.
                {budget.connectionTight && ' The next sample departure leaves with less than five minutes to spare after the planning buffer; allow extra time.'}
              </p>
            </div>
          </>
        ) : route && selectedStop ? (
          <div className="panel planner-empty-state">
            <strong>No sample departure fits this arrival time</strong>
            <p>Try an earlier expected arrival time. This sample timetable is limited to morning demo departures and is not a real PMPML schedule.</p>
          </div>
        ) : (
          <div className="panel planner-empty-state">
            <strong>No route selected</strong>
            <p>Choose a stop with sample route information to continue.</p>
          </div>
        )}

        {route && selectedStop && (
          <div className="freshness-card">
            <div className="freshness-indicator" aria-hidden="true">!</div>
            <div>
              <strong>Illustrative demo schedule · not live</strong>
              <p>
                Departures {route.departures[0]?.time}–{route.departures.at(-1)?.time} are simulated examples,
                not published PMPML times. No real-time arrival or vehicle-location feed is connected.
                Source: {route.source}.
              </p>
            </div>
          </div>
        )}
        <p className="bus-disclaimer">
          Estimates assume a 3-minute station exit, 75 m/min walking speed, and a 5-minute boarding buffer.
          Actual routes, service, wait, and travel time may differ. Do not rely on this demo for a real connection.
        </p>
      </section>
    </div>
  )
}

function TimeSegment({
  label,
  value,
  detail,
}: {
  label: string
  value: string
  detail: string
}) {
  return (
    <div className="time-segment">
      <span className="timeline-dot" aria-hidden="true" />
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{detail}</small>
      </div>
    </div>
  )
}
