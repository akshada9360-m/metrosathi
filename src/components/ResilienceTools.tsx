import { useState } from 'react'
import { festivalEvents } from '../data/festivals'
import { stations } from '../data/stations'
import type { CommunityReport, CommunityReportType, FestivalEvent } from '../types/community'
import type { MetroStation } from '../types/station'
import './ResilienceTools.css'

const REPORTS_STORAGE_KEY = 'metro-saathi-community-reports-v1'
const REPORT_EXPIRY_MS = 4 * 60 * 60 * 1000
const demoCrowdTimestamp = new Date().toLocaleTimeString()

function createCommunityReport(stationId: string, area: string, type: CommunityReportType, note: string): CommunityReport {
  return {
    id: crypto.randomUUID(),
    stationId,
    area,
    type,
    note,
    createdAt: new Date().toISOString(),
    status: 'unverified',
  }
}

function readReports(): CommunityReport[] {
  const stored = window.localStorage.getItem(REPORTS_STORAGE_KEY)
  if (!stored) return []
  const parsed: unknown = JSON.parse(stored)
  if (!Array.isArray(parsed)) throw new Error('Saved community reports have an invalid format.')
  return parsed.filter(isCommunityReport)
}

function isCommunityReport(value: unknown): value is CommunityReport {
  if (!value || typeof value !== 'object') return false
  const report = value as Partial<CommunityReport>
  return typeof report.id === 'string'
    && typeof report.stationId === 'string'
    && typeof report.area === 'string'
    && typeof report.note === 'string'
    && typeof report.createdAt === 'string'
    && ['crowd', 'lift', 'blocked_path', 'bus_stop_change', 'other'].includes(String(report.type))
    && ['unverified', 'confirmed', 'expired'].includes(String(report.status))
}

function reportsWithExpiry(reports: CommunityReport[]): CommunityReport[] {
  const now = Date.now()
  return reports.map((report) => {
    const createdAt = Date.parse(report.createdAt)
    if (!Number.isFinite(createdAt) || now - createdAt >= REPORT_EXPIRY_MS) {
      return { ...report, status: 'expired' }
    }
    return report
  })
}

const reportLabels: Record<CommunityReportType, string> = {
  crowd: 'Crowd level',
  lift: 'Lift issue',
  blocked_path: 'Blocked path',
  bus_stop_change: 'Bus stop change',
  other: 'Other condition',
}

export function CommunityReports({ station }: { station: MetroStation }) {
  const [savedReports, setSavedReports] = useState<{ items: CommunityReport[]; error: string }>(() => {
    try {
      return { items: reportsWithExpiry(readReports()), error: '' }
    } catch (error) {
      return {
        items: [],
        error: error instanceof Error ? error.message : 'Could not read saved reports.',
      }
    }
  })
  const reports = savedReports.items
  const [type, setType] = useState<CommunityReportType>('crowd')
  const [area, setArea] = useState('')
  const [note, setNote] = useState('')
  const [statusMessage, setStatusMessage] = useState(savedReports.error)

  const submitReport = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedArea = area.trim()
    const trimmedNote = note.trim()
    if (trimmedArea.length < 2) {
      setStatusMessage('Enter a station area (at least 2 characters).')
      return
    }
    if (trimmedNote.length > 240) {
      setStatusMessage('Keep the optional note to 240 characters or fewer.')
      return
    }
    const report = createCommunityReport(station.id, trimmedArea, type, trimmedNote)
    const nextReports = reportsWithExpiry([report, ...reports])
    try {
      window.localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(nextReports))
      setSavedReports({ items: nextReports, error: '' })
      setArea('')
      setNote('')
      setStatusMessage('Report saved locally and marked unverified. It is not sent to station staff.')
    } catch {
      setStatusMessage('Could not save this report on this device. Check browser storage is available.')
    }
  }

  const stationReports = reportsWithExpiry(reports).filter((report) => report.stationId === station.id)

  return (
    <div className="resilience-column">
      <section className="panel community-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">COMMUNITY STATION REPORTS</p>
            <h2>Share a temporary condition</h2>
          </div>
          <span className="demo-tag">LOCAL ONLY</span>
        </div>
        <p className="tool-intro">Reports are anonymous on this device, time-stamped, unverified, and automatically marked expired after four hours. They are not sent to anyone.</p>
        <form className="report-form" onSubmit={submitReport}>
          <label className="tool-field">
            <span>Report type</span>
            <select value={type} onChange={(event) => setType(event.target.value as CommunityReportType)}>
              {Object.entries(reportLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label className="tool-field">
            <span>Station area</span>
            <input value={area} onChange={(event) => setArea(event.target.value)} maxLength={80} required placeholder="For example: near Exit A" />
          </label>
          <label className="tool-field">
            <span>Optional note <small>{note.length}/240</small></span>
            <textarea value={note} onChange={(event) => setNote(event.target.value)} maxLength={240} rows={3} placeholder="Briefly describe what you noticed" />
          </label>
          <button className="primary-button" type="submit">Save report on this device</button>
        </form>
        {statusMessage && <p className="tool-status" role="status">{statusMessage}</p>}
      </section>

      <section className="panel reports-list-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">{station.name.toUpperCase()}</p>
            <h2>Recent reports</h2>
          </div>
          <span className="result-count">{stationReports.length} reports</span>
        </div>
        {stationReports.length ? (
          <ul className="community-report-list">
            {stationReports.map((report) => (
              <li key={report.id}>
                <div className="report-row-heading">
                  <strong>{reportLabels[report.type]}</strong>
                  <span className={`report-state ${report.status}`}>{report.status}</span>
                </div>
                <span className="report-area">{report.area}</span>
                {report.note && <p>{report.note}</p>}
                <time dateTime={report.createdAt}>{report.createdAt.slice(0, 16).replace('T', ' ')}</time>
              </li>
            ))}
          </ul>
        ) : (
          <div className="planner-empty-state">
            <strong>No reports for this station</strong>
            <p>Reports submitted on this device will appear here until they expire.</p>
          </div>
        )}
        <p className="report-caveat">Never rely on a single unverified report to reroute. Confirm conditions with station staff and signage.</p>
      </section>
    </div>
  )
}

export function FestivalMode({ onSelectStation }: { onSelectStation: (stationId: string) => void }) {
  const [eventId, setEventId] = useState(festivalEvents[0].id)
  const [arrivalTime, setArrivalTime] = useState('')
  const event = festivalEvents.find((item) => item.id === eventId) ?? festivalEvents[0]
  const results = event.candidateStationIds
    .map((id) => stations.find((station) => station.id === id))
    .filter((station): station is MetroStation => Boolean(station))
    .map((station) => {
      const walkingDistance = event.sampleWalkingDistances[station.id]
      const walkMinutes = Math.ceil(walkingDistance / 75)
      const crowd = event.sampleCrowdLevels[station.id]
      const rank = walkingDistance + (crowd === 'high' ? 800 : crowd === 'moderate' ? 300 : 0)
      return { station, walkingDistance, walkMinutes, crowd, rank }
    })
    .sort((first, second) => first.rank - second.rank)

  return (
    <section className="panel festival-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">EVENT ROUTE COMPARISON</p>
          <h2>Festival mode</h2>
        </div>
        <span className="demo-tag">SIMULATED EXAMPLES</span>
      </div>
      <p className="tool-intro">Compare candidate stations for a configurable example event. This demo has no official venue, advisories, live crowd feed, or predictive crowd model.</p>
      <div className="festival-controls">
        <label className="tool-field">
          <span>Example event</span>
          <select value={event.id} onChange={(item) => setEventId(item.target.value as FestivalEvent['id'])}>
            {festivalEvents.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}
          </select>
        </label>
        <label className="tool-field">
          <span>Planned arrival (optional)</span>
          <input type="datetime-local" value={arrivalTime} onChange={(item) => setArrivalTime(item.target.value)} />
        </label>
      </div>
      <div className="event-destination">
        <span aria-hidden="true">✳</span>
        <div><strong>{event.destination}</strong><small>{event.description}</small></div>
      </div>
      <div className="festival-result-list">
        {results.map((result, index) => (
          <article className={`festival-result ${index === 0 ? 'top-festival-result' : ''}`} key={result.station.id}>
            <div className="festival-result-head">
              <div className="festival-rank">{index + 1}</div>
              <div><strong>{result.station.name}</strong><small>{result.station.area} · {result.station.line}</small></div>
              {index === 0 && <span className="recommended-badge">BALANCED OPTION</span>}
            </div>
            <div className="festival-metrics">
              <span>Walk to event: <strong>{result.walkingDistance} m · ~{result.walkMinutes} min</strong></span>
              <span>Transfers: <strong>0 in this sample comparison</strong></span>
              <span>Accessibility: <strong>Not verified for event route</strong></span>
            </div>
            <div className="crowd-sample">
              <span className={`crowd-indicator crowd-${result.crowd}`} />
              Sample crowd indicator: <strong>{result.crowd}</strong>
              <span>· simulated · {demoCrowdTimestamp}</span>
            </div>
            <p className="crowd-confidence">Confidence: demo-only value · not measured or predictive</p>
            <p className="festival-tradeoff">
              {result.crowd === 'low'
                ? `Sample trade-off: lower simulated crowd and ${result.walkingDistance} m walk; crowd level is not live.`
                : result.crowd === 'high'
                  ? `Sample trade-off: ${result.walkingDistance} m walk; a simulated high crowd value is shown, not a verified warning.`
                  : `Sample trade-off: moderate simulated crowd and ${result.walkingDistance} m walk; compare walking distance with the other options.`}
            </p>
            <button className="text-link-button" onClick={() => onSelectStation(result.station.id)}>
            Set as selected station <span aria-hidden="true">→</span>
            </button>
          </article>
        ))}
      </div>
      <p className="report-caveat">Crowd indicators are fabricated demo values for illustrating the UI and have no predictive accuracy. {arrivalTime && `Arrival selected: ${arrivalTime.replace('T', ' ')}.`}</p>
    </section>
  )
}

export function PreferencesPanel({
  language,
  setLanguage,
  largeText,
  setLargeText,
  reducedWalking,
  setReducedWalking,
  stepFree,
  setStepFree,
  station,
  offlinePacks,
  onSaveStation,
  onReset,
  offlineDemo,
  setOfflineDemo,
  isOnline,
  storageError,
}: {
  language: 'en' | 'hi' | 'mr'
  setLanguage: (language: 'en' | 'hi' | 'mr') => void
  largeText: boolean
  setLargeText: (value: boolean) => void
  reducedWalking: boolean
  setReducedWalking: (value: boolean) => void
  stepFree: boolean
  setStepFree: (value: boolean) => void
  station: MetroStation
  offlinePacks: { stationId: string; savedAt: string }[]
  onSaveStation: () => void
  onReset: () => void
  offlineDemo: boolean
  setOfflineDemo: (value: boolean) => void
  isOnline: boolean
  storageError: string
}) {
  const savedStations = offlinePacks.flatMap((pack) => {
    const savedStation = stations.find((item) => item.id === pack.stationId)
    return savedStation ? [{ station: savedStation, savedAt: pack.savedAt }] : []
  })

  return (
    <div className="settings-grid">
      <section className="panel settings-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">PERSONALIZE YOUR EXPERIENCE</p>
            <h2>Preferences</h2>
          </div>
          <span className="demo-tag">SAVED ON THIS DEVICE</span>
        </div>
        <label className="tool-field settings-language">
          <span>Interface language</span>
          <select value={language} onChange={(event) => setLanguage(event.target.value as 'en' | 'hi' | 'mr')}>
            <option value="en">English</option>
            <option value="hi">हिन्दी · Hindi</option>
            <option value="mr">मराठी · Marathi</option>
          </select>
        </label>
        <PreferenceSwitch label="Larger text" detail="Increase interface text size" checked={largeText} onChange={setLargeText} />
        <PreferenceSwitch label="Prefer shorter walks" detail="Remember this route preference" checked={reducedWalking} onChange={setReducedWalking} />
        <PreferenceSwitch label="Prefer step-free routes" detail="Remember this route preference" checked={stepFree} onChange={setStepFree} />
        <button className="secondary-button settings-reset" onClick={onReset}>Reset preferences</button>
        {storageError && <p className="tool-status" role="status">{storageError}</p>}
        <p className="privacy-note">Your preferences are stored locally in this browser. No account is needed, and this demo sends no preferences to a server.</p>
      </section>
      <section className="panel offline-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">OFFLINE STATION MODE</p>
            <h2>Saved station packs</h2>
          </div>
          <span className={`offline-dot ${isOnline ? 'online' : 'offline'}`} />
        </div>
        <p className="tool-intro">Save the selected station's sample exits, amenities, and notes in browser storage. Live service, bus, and crowd updates are unavailable offline.</p>
        <div className="offline-current">
          <strong>{station.name}</strong>
          <span>{station.amenities.length} sample places · {station.exits.length} sample exits</span>
        </div>
        <button className="primary-button" onClick={onSaveStation}>
          {offlinePacks.some((pack) => pack.stationId === station.id) ? 'Refresh saved station pack' : 'Save selected station for offline use'}
        </button>
        <PreferenceSwitch
          label="Offline demo mode"
          detail={offlineDemo ? 'Demo mode is on; live data is unavailable.' : 'Turn on to preview offline notices.'}
          checked={offlineDemo}
          onChange={setOfflineDemo}
        />
        <div className="saved-pack-list">
          <strong>Available on this device</strong>
          {savedStations.length ? savedStations.map(({ station: item, savedAt }) => (
            <span key={item.id}>{item.name} <small>· saved {savedAt.slice(0, 16).replace('T', ' ')}</small></span>
          )) : <p>No station packs saved yet.</p>}
        </div>
        <p className="privacy-note">Station records ship with the app; saving keeps a local station reference and timestamp, not official data or live updates.</p>
      </section>
      <section className="panel emergency-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">EMERGENCY & HELP POINTS</p>
            <h2>Verified information only</h2>
          </div>
          <span className="demo-tag">NO VERIFIED CONTACTS</span>
        </div>
        <p className="tool-intro">This prototype has no verified help-desk location, accessible assistance point, or official contact number for {station.name}. We will not invent one.</p>
        <div className="guide-note">
          <span aria-hidden="true">!</span>
          <p>For assistance, ask uniformed station staff or use official station signage. In an emergency, contact local official emergency services directly. This app has not contacted anyone.</p>
        </div>
      </section>
    </div>
  )
}

function PreferenceSwitch({
  label,
  detail,
  checked,
  onChange,
}: {
  label: string
  detail: string
  checked: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <label className="preference-row">
      <span><strong>{label}</strong><small>{detail}</small></span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
    </label>
  )
}
