import type { Language, TranslationKey } from '../i18n/translations'
import { translate } from '../i18n/translations'

export type PageId =
  | 'overview'
  | 'planner'
  | 'bus'
  | 'nearby'
  | 'station'
  | 'saved'
  | 'assistant'
  | 'festival'
  | 'reports'
  | 'settings'

interface SidebarProps {
  activePage: PageId
  savedCount: number
  language: Language
  onNavigate: (page: PageId) => void
}

const navigation: { id: PageId; key: TranslationKey; icon: string }[] = [
  { id: 'overview', key: 'overview', icon: '⌂' },
  { id: 'planner', key: 'planner', icon: '↗' },
  { id: 'bus', key: 'bus', icon: '⇄' },
  { id: 'nearby', key: 'nearby', icon: '⌖' },
  { id: 'station', key: 'station', icon: '▤' },
  { id: 'saved', key: 'saved', icon: '♡' },
  { id: 'assistant', key: 'assistant', icon: '✳' },
  { id: 'festival', key: 'festival', icon: '✺' },
  { id: 'reports', key: 'reports', icon: '!' },
  { id: 'settings', key: 'settings', icon: '⚙' },
]

export function Sidebar({ activePage, savedCount, language, onNavigate }: SidebarProps) {
  return (
    <aside className="sidebar">
      <button className="brand" onClick={() => onNavigate('overview')} aria-label="Metro Saathi home">
        <span className="brand-mark" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        <span className="brand-copy">
          <strong>metro saathi</strong>
          <small>YOUR CITY, MADE EASIER</small>
        </span>
      </button>

      <div className="sidebar-label">YOUR JOURNEY</div>
      <nav className="side-nav" aria-label="Main navigation">
        {navigation.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activePage === item.id ? 'is-active' : ''}`}
            onClick={() => onNavigate(item.id)}
            aria-current={activePage === item.id ? 'page' : undefined}
          >
            <span className="nav-icon" aria-hidden="true">{item.icon}</span>
            {translate(language, item.key)}
            {item.id === 'saved' && savedCount > 0 && <span className="nav-count">{savedCount}</span>}
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="help-card">
          <span className="help-icon" aria-hidden="true">✳</span>
          <strong>Here for every journey</strong>
          <p>Clearer station information, one step at a time.</p>
        </div>
        <div className="profile-row">
          <div className="avatar" aria-hidden="true">MS</div>
          <div>
            <strong>Guest passenger</strong>
            <small>No account needed</small>
          </div>
          <span className="profile-menu" aria-hidden="true">···</span>
        </div>
      </div>
    </aside>
  )
}
