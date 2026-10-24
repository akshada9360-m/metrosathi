import { useEffect, useState } from 'react'
import { AmenityList } from './components/AmenityList'
import { BusConnectionPlanner } from './components/BusConnectionPlanner'
import { JourneyPlanner } from './components/JourneyPlanner'
import { FestivalMode, CommunityReports, PreferencesPanel } from './components/ResilienceTools'
import { Sidebar, type PageId } from './components/Sidebar'
import { StationSelector } from './components/StationSelector'
import { TravelAssistant } from './components/TravelAssistant'
import { stations } from './data/stations'
import { translate, type Language, type TranslationKey } from './i18n/translations'
import { isStringArray, usePersistentState } from './hooks/usePersistentState'
import type { UserPreferences } from './types/community'
import './App.css'

interface OfflinePack {
  stationId: string
  savedAt: string
}

const defaultPreferences: UserPreferences = {
  language: 'en',
  largeText: false,
  reducedWalking: false,
  stepFree: false,
}

function createOfflinePack(stationId: string): OfflinePack {
  return { stationId, savedAt: new Date().toISOString() }
}

function isPreferences(value: unknown): value is UserPreferences {
  if (!value || typeof value !== 'object') return false
  const preferences = value as Partial<UserPreferences>
  return ['en', 'hi', 'mr'].includes(String(preferences.language))
    && typeof preferences.largeText === 'boolean'
    && typeof preferences.reducedWalking === 'boolean'
    && typeof preferences.stepFree === 'boolean'
}

function isOfflinePacks(value: unknown): value is OfflinePack[] {
  return Array.isArray(value) && value.every((item) =>
    item
    && typeof item === 'object'
    && typeof item.stationId === 'string'
    && typeof item.savedAt === 'string',
  )
}

const pageTranslationKeys: Record<PageId, TranslationKey> = {
  overview: 'overview',
  planner: 'planner',
  bus: 'bus',
  nearby: 'nearby',
  station: 'station',
  saved: 'saved',
  assistant: 'assistant',
  festival: 'festival',
  reports: 'reports',
  settings: 'settings',
}

function App() {
  const [activePage, setActivePage] = useState<PageId>('overview')
  const [selectedStationId, setSelectedStationId] = usePersistentState(
    'metro-saathi-selected-station-v1',
    stations[0].id,
    (value): value is string => typeof value === 'string'
      && stations.some((item) => item.id === value),
  )
  const station = stations.find((item) => item.id === selectedStationId) ?? stations[0]
  const [savedStationIds, setSavedStationIds] = usePersistentState(
    'metro-saathi-saved-stations-v1',
    [stations[0].id],
    isStringArray,
  )
  const [preferences, setPreferences, preferencesError] = usePersistentState(
    'metro-saathi-preferences-v1',
    defaultPreferences,
    isPreferences,
  )
  const [offlinePacks, setOfflinePacks, offlinePacksError] = usePersistentState<OfflinePack[]>(
    'metro-saathi-offline-packs-v1',
    [],
    isOfflinePacks,
  )
  const [offlineDemo, setOfflineDemo] = usePersistentState(
    'metro-saathi-offline-demo-v1',
    false,
    (value): value is boolean => typeof value === 'boolean',
  )
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    document.documentElement.lang = preferences.language
  }, [preferences.language])

  useEffect(() => {
    const updateOnlineState = () => setIsOnline(navigator.onLine)
    window.addEventListener('online', updateOnlineState)
    window.addEventListener('offline', updateOnlineState)
    return () => {
      window.removeEventListener('online', updateOnlineState)
      window.removeEventListener('offline', updateOnlineState)
    }
  }, [])

  const toggleSavedStation = () => {
    setSavedStationIds((saved) => saved.includes(station.id)
      ? saved.filter((stationId) => stationId !== station.id)
      : [...saved, station.id])
  }

  const currentPageTitle = activePage === 'overview'
    ? translate(preferences.language, 'greeting')
    : activePage === 'settings'
      ? translate(preferences.language, 'settingsTitle')
      : translate(preferences.language, pageTranslationKeys[activePage])

  const updatePreference = <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
    setPreferences((current) => ({ ...current, [key]: value }))
  }

  const saveOfflinePack = () => {
    const pack = createOfflinePack(station.id)
    setOfflinePacks((current) => [
      pack,
      ...current.filter((item) => item.stationId !== station.id),
    ])
  }

  const resetPreferences = () => setPreferences(defaultPreferences)
  const journeyPreferences = {
    stepFree: preferences.stepFree,
    fewerStairs: false,
    shorterWalk: preferences.reducedWalking,
    preferLiftRamp: false,
  }

  return (
    <div lang={preferences.language} className={`app-shell ${preferences.largeText ? 'large-text-mode' : ''}`}>
      <Sidebar
        activePage={activePage}
        savedCount={savedStationIds.length}
        language={preferences.language}
        onNavigate={setActivePage}
      />
      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">
            <span>Passenger companion</span>
            <span aria-hidden="true">/</span>
            <strong>{activePage === 'overview' ? translate(preferences.language, 'overview') : currentPageTitle}</strong>
          </div>
          <div className="topbar-actions">
            <span className="demo-pill"><span /> DEMO DATA</span>
          </div>
        </header>

        <div className="content-wrap">
          <div className="welcome-row">
            <div>
              <p className="eyebrow">PUNE METRO · PASSENGER ASSISTANCE</p>
              <h1>{currentPageTitle}</h1>
              <p className="welcome-subtitle">
                {activePage === 'overview'
                  ? translate(preferences.language, 'subtitle')
                  : activePage === 'planner'
                    ? `Find a sample exit route from ${station.name}.`
                    : activePage === 'bus'
                      ? `Plan a sample bus transfer from ${station.name}.`
                      : activePage === 'assistant'
                        ? `Get answers grounded in ${station.name}'s local sample data.`
                        : activePage === 'festival'
                          ? 'Compare sample routes; crowd examples are not live or predictive.'
                          : activePage === 'reports'
                            ? `Recent local reports for ${station.name}.`
                            : activePage === 'settings'
                              ? 'Choose language, accessibility, and offline preferences.'
                    : `Explore ${station.name} and its neighbourhood.`}
              </p>
            </div>
            <StationSelector
              stations={stations}
              selectedStationId={selectedStationId}
              onSelect={setSelectedStationId}
            />
          </div>

          <div className="notice-banner" role="note">
            <span className="notice-icon" aria-hidden="true">i</span>
            <p><strong>Demo experience.</strong> {translate(preferences.language, 'demoNotice')}</p>
            <button onClick={() => setActivePage('station')}>About this data <span aria-hidden="true">→</span></button>
          </div>
          {(!isOnline || offlineDemo) && (
            <div className="offline-banner" role="status">
              <strong>{isOnline ? 'Offline demo mode enabled' : 'You are offline'}</strong>
              <span>Saved station reference data remains available. Live metro, bus, and crowd updates are unavailable.</span>
            </div>
          )}

          {activePage === 'overview' && (
            <Overview
              station={station}
              language={preferences.language}
              onExplore={() => setActivePage('nearby')}
              onPlanJourney={() => setActivePage('planner')}
              onBusConnection={() => setActivePage('bus')}
              onAssistant={() => setActivePage('assistant')}
              onFestival={() => setActivePage('festival')}
              onReport={() => setActivePage('reports')}
              onToggleSave={toggleSavedStation}
              isSaved={savedStationIds.includes(station.id)}
            />
          )}
          {activePage === 'planner' && <JourneyPlanner key={station.id} station={station} initialPreferences={journeyPreferences} />}
          {activePage === 'bus' && <BusConnectionPlanner key={station.id} station={station} />}
          {activePage === 'nearby' && <AmenityList amenities={station.amenities} />}
          {activePage === 'station' && <StationGuide station={station} />}
          {activePage === 'assistant' && <TravelAssistant key={`${station.id}-${preferences.language}`} station={station} language={preferences.language} preferences={journeyPreferences} />}
          {activePage === 'festival' && <FestivalMode onSelectStation={setSelectedStationId} />}
          {activePage === 'reports' && <CommunityReports station={station} />}
          {activePage === 'settings' && (
            <PreferencesPanel
              language={preferences.language}
              setLanguage={(value) => {
                document.documentElement.lang = value
                updatePreference('language', value)
              }}
              largeText={preferences.largeText}
              setLargeText={(value) => updatePreference('largeText', value)}
              reducedWalking={preferences.reducedWalking}
              setReducedWalking={(value) => updatePreference('reducedWalking', value)}
              stepFree={preferences.stepFree}
              setStepFree={(value) => updatePreference('stepFree', value)}
              station={station}
              offlinePacks={offlinePacks}
              onSaveStation={saveOfflinePack}
              onReset={resetPreferences}
              offlineDemo={offlineDemo}
              setOfflineDemo={setOfflineDemo}
              isOnline={isOnline}
              storageError={[preferencesError, offlinePacksError].filter(Boolean).join(' ')}
            />
          )}
          {activePage === 'saved' && (
            <SavedStations
              savedStationIds={savedStationIds}
              selectedStationId={station.id}
              onSelectStation={setSelectedStationId}
              onExplore={() => setActivePage('nearby')}
            />
          )}

          <footer className="page-footer">
            <span>Metro Saathi <i>·</i> A friend for the way ahead</span>
            <span>All nearby listings are demo examples for this prototype.</span>
          </footer>
        </div>
      </main>
    </div>
  )
}

function Overview({
  station,
  language,
  onExplore,
  onPlanJourney,
  onBusConnection,
  onAssistant,
  onFestival,
  onReport,
  onToggleSave,
  isSaved,
}: {
  station: (typeof stations)[number]
  language: Language
  onExplore: () => void
  onPlanJourney: () => void
  onBusConnection: () => void
  onAssistant: () => void
  onFestival: () => void
  onReport: () => void
  onToggleSave: () => void
  isSaved: boolean
}) {
  return (
    <>
      <section className={`hero-card ${station.line.includes('Purple') ? 'has-purple-line' : 'has-aqua-line'}`}>
        <div className="hero-copy">
          <div className="station-kicker"><span className="live-dot" /> {translate(language, 'selectedStation')}</div>
          <h2>{station.name}</h2>
          <p className="station-area"><span aria-hidden="true">⌖</span> {station.area}, Pune</p>
          <div className="metro-line-badges" aria-label={`Metro line${station.line.includes('&') ? 's' : ''}: ${station.line}`}>
            {station.line.includes('Purple') && <span className="metro-line-badge purple-line"><i />Purple Line</span>}
            {station.line.includes('Aqua') && <span className="metro-line-badge aqua-line"><i />Aqua Line</span>}
          </div>
          <p className="hero-description">{station.description}</p>
          <div className="hero-actions">
            <button className="primary-button" onClick={onExplore}>{translate(language, 'explorePlaces')} <span aria-hidden="true">→</span></button>
            <button className="text-button" onClick={onToggleSave} aria-pressed={isSaved}>
              {isSaved ? '✓ Saved · Remove' : '+ Save station'}
            </button>
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="art-sun" />
          <div className="art-hill hill-back" />
          <div className="art-hill hill-front" />
          <div className="art-station">
            <div className="station-roof" />
            <div className="station-platform"><span /><span /><span /></div>
            <div className="station-pill">PUNE METRO</div>
          </div>
          <div className="art-route route-one" />
          <div className="art-route route-two" />
        </div>
        <span className="hero-art-label">Metro-inspired illustration · not a station map</span>
      </section>

      <div className="section-title-row">
        <div>
          <p className="eyebrow">{translate(language, 'overview')}</p>
          <h2>{translate(language, 'journeyTitle')}</h2>
        </div>
        <span className="quiet-label">Choose a tool to get started</span>
      </div>

      <div className="quick-actions">
        <button className="quick-card active-card" onClick={onExplore}>
          <span className="quick-icon icon-purple">⌖</span>
          <span className="quick-card-copy"><strong>{translate(language, 'nearbyTitle')}</strong><small>Explore the neighbourhood</small></span>
          <span className="quick-arrow" aria-hidden="true">↗</span>
        </button>
        <button className="quick-card" onClick={onPlanJourney}>
          <span className="quick-icon icon-mint">↗</span>
          <span className="quick-card-copy"><strong>{translate(language, 'planJourney')}</strong><small>Compare sample exit routes</small></span>
          <span className="quick-arrow" aria-hidden="true">↗</span>
        </button>
        <button className="quick-card" onClick={onBusConnection}>
          <span className="quick-icon icon-peach">⇄</span>
          <span className="quick-card-copy"><strong>{translate(language, 'busConnection')}</strong><small>Estimate a sample transfer</small></span>
          <span className="quick-arrow" aria-hidden="true">↗</span>
        </button>
        <button className="quick-card" onClick={onAssistant}>
          <span className="quick-icon icon-purple">✳</span>
          <span className="quick-card-copy"><strong>{translate(language, 'assistant')}</strong><small>Ask a question about this station</small></span>
          <span className="quick-arrow" aria-hidden="true">↗</span>
        </button>
        <button className="quick-card" onClick={onFestival}>
          <span className="quick-icon icon-mint">✺</span>
          <span className="quick-card-copy"><strong>{translate(language, 'festival')}</strong><small>Compare sample event routes</small></span>
          <span className="quick-arrow" aria-hidden="true">↗</span>
        </button>
        <button className="quick-card" onClick={onReport}>
          <span className="quick-icon icon-peach">!</span>
          <span className="quick-card-copy"><strong>{translate(language, 'reports')}</strong><small>Share a local condition</small></span>
          <span className="quick-arrow" aria-hidden="true">↗</span>
        </button>
      </div>

      <div className="dashboard-grid">
        <AmenityList amenities={station.amenities} compact />
        <section className="panel station-snapshot">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">STATION SNAPSHOT</p>
              <h2>At a glance</h2>
            </div>
            <span className="snapshot-icon" aria-hidden="true">⌖</span>
          </div>
          <div className="snapshot-station">{station.name}</div>
          <div className="snapshot-line"><span className="line-dot" />{station.line}</div>
          <div className="snapshot-divider" />
          <div className="snapshot-facts">
            <div><strong>{station.amenities.length}</strong><span>sample places</span></div>
            <div><strong>{station.area}</strong><span>neighbourhood</span></div>
          </div>
          <p className="snapshot-note"><span aria-hidden="true">i</span> No live service or accessibility status is available in this demo.</p>
        </section>
      </div>
    </>
  )
}

function StationGuide({ station }: { station: (typeof stations)[number] }) {
  return (
    <section className="panel guide-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">STATION INFORMATION</p>
          <h2>{station.name}</h2>
        </div>
        <span className="demo-tag">SAMPLE DATA</span>
      </div>
      <p className="guide-intro">{station.description}</p>
      <div className="guide-details">
        <div><span>Neighbourhood</span><strong>{station.area}, Pune</strong></div>
        <div><span>Metro line</span><strong>{station.line}</strong></div>
        <div><span>Nearby sample listings</span><strong>{station.amenities.length}</strong></div>
        <div><span>Data status</span><strong>Demo only · not verified</strong></div>
      </div>
      <div className="guide-note">
        <span aria-hidden="true">!</span>
        <p>Sample exits and accessibility notes are unverified demo data, not official station information. Train schedules, live lift status, and verified help-point details are not connected. Check official station signage and staff for current guidance.</p>
      </div>
    </section>
  )
}

function SavedStations({
  savedStationIds,
  selectedStationId,
  onSelectStation,
  onExplore,
}: {
  savedStationIds: string[]
  selectedStationId: string
  onSelectStation: (stationId: string) => void
  onExplore: () => void
}) {
  const savedStations = stations.filter((station) => savedStationIds.includes(station.id))

  return (
    <section className="panel saved-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">QUICK ACCESS</p>
          <h2>Saved stations</h2>
        </div>
        <span className="result-count">{savedStations.length} saved</span>
      </div>
      {savedStations.length > 0 ? (
        <ul className="saved-list">
          {savedStations.map((station) => (
            <li key={station.id}>
              <button
                className={`saved-station-row ${selectedStationId === station.id ? 'is-selected' : ''}`}
                onClick={() => onSelectStation(station.id)}
              >
                <span className="saved-station-icon" aria-hidden="true">M</span>
                <span><strong>{station.name}</strong><small>{station.area} · {station.line}</small></span>
                <span className="saved-current">{selectedStationId === station.id ? 'Selected' : 'Choose'}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="empty-state">
          <span aria-hidden="true">♡</span>
          <strong>No saved stations yet</strong>
          <p>Choose a station from the selector and save it from the overview.</p>
        </div>
      )}
      <button className="secondary-button" onClick={onExplore}>Explore selected station <span aria-hidden="true">→</span></button>
    </section>
  )
}

export default App
