import { useMemo, useState } from 'react'
import type { Amenity, AmenityCategory } from '../types/station'

const categories: ('All' | AmenityCategory)[] = [
  'All',
  'Health',
  'Education',
  'Food',
  'Transport',
  'Essentials',
]

const categoryIcons: Record<AmenityCategory, string> = {
  Health: '+',
  Education: '▤',
  Food: '◒',
  Transport: '↗',
  Essentials: '◇',
}

interface AmenityListProps {
  amenities: Amenity[]
  compact?: boolean
}

export function AmenityList({ amenities, compact = false }: AmenityListProps) {
  const [activeCategory, setActiveCategory] = useState<'All' | AmenityCategory>('All')
  const [query, setQuery] = useState('')
  const visibleAmenities = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return amenities
      .filter((amenity) => activeCategory === 'All' || amenity.category === activeCategory)
      .filter((amenity) => !normalizedQuery || amenity.name.toLowerCase().includes(normalizedQuery))
      .sort((first, second) => first.distanceMeters - second.distanceMeters)
  }, [activeCategory, amenities, query])
  const displayedAmenities = compact ? visibleAmenities.slice(0, 3) : visibleAmenities

  return (
    <section className="panel places-panel" id="nearby-places">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">AROUND YOUR STATION</p>
          <h2>Nearby places</h2>
        </div>
        <span className="result-count">{visibleAmenities.length} places</span>
      </div>

      {!compact && (
        <>
          <label className="search-field">
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              aria-label="Search places or categories"
              placeholder="Search places or categories"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <kbd>/</kbd>
          </label>
          <div className="category-list" aria-label="Filter places by category">
            {categories.map((category) => (
              <button
                key={category}
                className={`category-chip ${activeCategory === category ? 'selected' : ''}`}
                onClick={() => setActiveCategory(category)}
                aria-pressed={activeCategory === category}
              >
                {category}
              </button>
            ))}
          </div>
        </>
      )}

      {displayedAmenities.length > 0 ? (
        <ul className={`amenity-list ${compact ? 'is-compact' : ''}`}>
          {displayedAmenities.map((amenity) => (
            <li className="amenity-row" key={amenity.id}>
              <span className={`amenity-icon icon-${amenity.category.toLowerCase()}`} aria-hidden="true">
                {categoryIcons[amenity.category]}
              </span>
              <div className="amenity-copy">
                <strong>{amenity.name}</strong>
                <span>{amenity.category} <i>·</i> {amenity.description}</span>
              </div>
              <span className="amenity-distance">
                {amenity.distanceMeters >= 1000
                  ? `${(amenity.distanceMeters / 1000).toFixed(1)} km`
                  : `${amenity.distanceMeters} m`}
                <small>{amenity.walkMinutes} min walk*</small>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="empty-state">
          <span aria-hidden="true">⌕</span>
          <strong>No places found</strong>
          <p>Try another search or choose a different category.</p>
        </div>
      )}

      <p className="data-footnote">*Walking times are illustrative estimates. Demo listings are not verified.</p>
    </section>
  )
}
