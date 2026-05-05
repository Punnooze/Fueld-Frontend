import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useFoods } from '../hooks/useFoods'
import { useCreateLog } from '../hooks/useLogs'
import { BottomSheet } from '../components/BottomSheet'
import { useToast } from '../components/Toast'
import { PageHeader } from '../components/ui/PageHeader'
import { MetricNumber } from '../components/ui/MetricNumber'
import { SearchIcon, BarcodeIcon, FilterIcon, PlusIcon } from '../assets/icons'
import { today, formatDate } from '../utils/dates'
import type { FoodItem } from '../api/foods'
import styles from './LogFood.module.css'

type Filter = 'All' | 'Meals' | 'Items' | 'High Protein' | 'Low Cal'
const FILTERS: Filter[] = ['All', 'Meals', 'Items', 'High Protein', 'Low Cal']
const QUICK_AMOUNTS = [0.5, 1, 1.5, 2]

export const LogFood = () => {
  const [searchParams] = useSearchParams()
  const [search, setSearch]   = useState('')
  const [filter, setFilter]   = useState<Filter>('All')
  const [selected, setSelected] = useState<FoodItem | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [note, setNote]       = useState('')
  const [date, setDate]       = useState(searchParams.get('date') || today())

  const { data: foods = [], isLoading, isError } = useFoods()
  const createLog = useCreateLog(date)
  const { showToast } = useToast()

  const filtered = useMemo(() => {
    let list = foods
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(f => f.name.toLowerCase().includes(q))
    }
    if (filter === 'Meals')       list = list.filter(f => f.type === 'meal')
    if (filter === 'Items')       list = list.filter(f => f.type === 'item')
    if (filter === 'High Protein') list = [...list].sort((a, b) => b.protein - a.protein)
    if (filter === 'Low Cal')     list = [...list].sort((a, b) => a.calories - b.calories)
    return list
  }, [foods, search, filter])

  const meals = filtered.filter(f => f.type === 'meal')
  const items = filtered.filter(f => f.type === 'item')
  const showGroups = filter === 'All' || filter === 'High Protein' || filter === 'Low Cal'

  const preview = selected ? {
    calories: Math.round(selected.calories * quantity),
    protein:  Math.round(selected.protein  * quantity),
    carbs:    Math.round((selected.carbs ?? 0) * quantity),
    fat:      Math.round((selected.fat   ?? 0) * quantity),
  } : null

  const handleAdd = async () => {
    if (!selected) return
    try {
      await createLog.mutateAsync({ foodItemId: selected.id, quantity, date, note: note.trim() || undefined })
      showToast('Logged!')
      setSelected(null); setQuantity(1); setNote('')
    } catch { showToast('Failed to log', 'error') }
  }

  const renderRow = (food: FoodItem) => (
    <button key={food.id} className={styles.foodRow} onClick={() => { setSelected(food); setQuantity(1) }}>
      <div className="stack gap-4 flex-1 min-w-0">
        <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-hi)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {food.name}
        </span>
        <span style={{ fontSize: 13, color: 'var(--text-mid)' }}>
          {food.calories} kcal ·{' '}
          <span style={{ color: 'var(--protein)' }}>{food.protein}g P</span> ·{' '}
          <span style={{ color: 'var(--carbs)'   }}>{food.carbs}g C</span> ·{' '}
          <span style={{ color: 'var(--fat)'     }}>{food.fat}g F</span>
        </span>
      </div>
      <div className={styles.addCircle}>
        <PlusIcon width={16} height={16} />
      </div>
    </button>
  )

  return (
    <div className="page">
      <PageHeader title="Log" subtitle={`${foods.length} items in library`} />

      {/* Search */}
      <div className={styles.searchWrap}>
        <span className={styles.searchIcon}><SearchIcon width={18} height={18} /></span>
        <input
          className={`input ${styles.searchInput}`}
          type="search"
          placeholder="Search meals & food items…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          autoComplete="off" autoCapitalize="off"
        />
        <button className={styles.barcodeBtn} aria-label="Scan barcode">
          <BarcodeIcon width={18} height={18} />
        </button>
      </div>

      {/* Filter chips */}
      <div className={styles.chipStrip}>
        <FilterIcon width={14} height={14} style={{ color: 'var(--text-low)', flexShrink: 0 }} />
        {FILTERS.map(f => (
          <button
            key={f}
            className={`chip ${filter === f ? 'chip-active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="stack gap-8 px">
          {[1, 2, 3, 4, 5].map(i => <div key={i} className="skeleton-row" style={{ height: 72 }} />)}
        </div>
      )}

      {isError && <p style={{ color: 'var(--danger)', fontSize: 14, padding: 16, textAlign: 'center' }}>Failed to load foods.</p>}

      {!isLoading && !isError && (
        <div className={styles.foodList}>
          {filtered.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-mid)', fontSize: 14, padding: '48px 0' }}>
              No results for "{search}"
            </p>
          ) : showGroups ? (
            <>
              {meals.length > 0 && (
                <div className="stack gap-6">
                  <span className="t-eyebrow" style={{ paddingTop: 8 }}>Meals</span>
                  {meals.map(renderRow)}
                </div>
              )}
              {items.length > 0 && (
                <div className="stack gap-6">
                  <span className="t-eyebrow" style={{ paddingTop: meals.length ? 12 : 8 }}>Food Items</span>
                  {items.map(renderRow)}
                </div>
              )}
            </>
          ) : (
            <div className="stack gap-6">{filtered.map(renderRow)}</div>
          )}
        </div>
      )}

      {/* Bottom sheet — quantity picker */}
      <BottomSheet open={!!selected} onClose={() => { setSelected(null); setQuantity(1); setNote('') }} title="Add to Log">
        {selected && (
          <div className="stack gap-14">
            <p style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--text-hi)' }}>
              {selected.name}
            </p>

            <div className="stack gap-6">
              <label className="t-eyebrow">Servings</label>
              <input
                className={`input input-mono`}
                type="number" inputMode="decimal" min="0.1" step="0.5"
                value={quantity || ''} onChange={e => { const n = parseFloat(e.target.value); setQuantity(isNaN(n) ? 0 : n) }}
              />
            </div>

            <div className="row gap-8">
              {QUICK_AMOUNTS.map(q => (
                <button
                  key={q}
                  className={`btn-ghost flex-1 ${quantity === q ? styles.quickActive : ''}`}
                  style={{ fontFamily: 'var(--font-mono)', height: 44 }}
                  onClick={() => setQuantity(q)}
                >
                  {q}×
                </button>
              ))}
            </div>

            {preview && (
              <div className="card-inner" style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 3 }}>
                <MetricNumber size="md" color="var(--accent)">{preview.calories} kcal</MetricNumber>
                <span style={{ fontSize: 13, color: 'var(--text-mid)' }}>
                  <span style={{ color: 'var(--protein)' }}>{preview.protein}g P</span>
                  {' · '}
                  <span style={{ color: 'var(--carbs)' }}>{preview.carbs}g C</span>
                  {' · '}
                  <span style={{ color: 'var(--fat)' }}>{preview.fat}g F</span>
                </span>
              </div>
            )}

            <input
              className="input"
              type="text"
              placeholder="Add a note…"
              value={note}
              onChange={e => setNote(e.target.value)}
              maxLength={120}
            />

            <div className="between">
              <label className="t-meta">Date</label>
              <input type="date" value={date} max={formatDate(new Date())} onChange={e => setDate(e.target.value)} />
            </div>

            <button className="btn-primary" onClick={handleAdd} disabled={createLog.isPending || !quantity}>
              {createLog.isPending ? 'Adding…' : 'Add to Log'}
            </button>
          </div>
        )}
      </BottomSheet>
    </div>
  )
}
