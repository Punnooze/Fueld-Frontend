import { useState, useMemo } from 'react'
import { useFoods } from '../hooks/useFoods'
import { useCreateLog } from '../hooks/useLogs'
import { BottomSheet } from '../components/BottomSheet'
import { useToast } from '../components/Toast'
import { today, formatDate } from '../utils/dates'
import type { FoodItem } from '../api/foods'
import styles from './LogFood.module.css'

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)

const QUICK_AMOUNTS = [0.5, 1, 1.5, 2]

export const LogFood = () => {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<FoodItem | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [note, setNote] = useState('')
  const [date, setDate] = useState(today())

  const { data: foods = [], isLoading, isError } = useFoods()
  const createLog = useCreateLog(date)
  const { showToast } = useToast()

  const filtered = useMemo(() => {
    if (!search.trim()) return foods
    const q = search.toLowerCase()
    return foods.filter(f => f.name.toLowerCase().includes(q))
  }, [foods, search])

  const filteredMeals = filtered.filter(f => f.type === 'meal')
  const filteredItems = filtered.filter(f => f.type === 'item')

  const preview = selected
    ? {
        calories: Math.round(selected.calories * quantity),
        protein: Math.round(selected.protein * quantity),
        carbs: Math.round((selected.carbs ?? 0) * quantity),
        fat: Math.round((selected.fat ?? 0) * quantity),
      }
    : null

  const handleAdd = async () => {
    if (!selected) return
    try {
      await createLog.mutateAsync({ foodItemId: selected.id, quantity, date, note: note.trim() || undefined })
      showToast('Logged!')
      setSelected(null)
      setQuantity(1)
      setNote('')
    } catch {
      showToast('Failed to log', 'error')
    }
  }

  const handleQuantityInput = (val: string) => {
    const n = parseFloat(val)
    if (!isNaN(n) && n > 0) setQuantity(n)
    else if (val === '') setQuantity(0)
  }

  const renderRow = (food: FoodItem) => (
    <button
      key={food.id}
      className={`${styles.foodRow} ${selected?.id === food.id ? styles.foodRowSelected : ''}`}
      onClick={() => { setSelected(food); setQuantity(1) }}
    >
      <div className={styles.foodInfo}>
        <span className={styles.foodName}>{food.name}</span>
        <span className={styles.foodMeta}>{food.calories} kcal · {food.protein}g protein per serving</span>
      </div>
      {selected?.id === food.id && <span className={styles.check}>✓</span>}
    </button>
  )

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Log</h1>
      </header>

      <div className={styles.searchWrap}>
        <span className={styles.searchIcon}><SearchIcon /></span>
        <input
          className={styles.searchInput}
          type="search"
          placeholder="Search meals & food items…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          autoComplete="off"
          autoCapitalize="off"
        />
      </div>

      {isLoading && (
        <div className={styles.skeleton}>
          {[1, 2, 3, 4, 5].map(i => <div key={i} className={styles.skeletonRow} />)}
        </div>
      )}

      {isError && <p className={styles.error}>Failed to load foods.</p>}

      {!isLoading && !isError && (
        <div className={styles.foodList}>
          {filtered.length === 0 ? (
            <p className={styles.noResults}>No results for "{search}"</p>
          ) : (
            <>
              {filteredMeals.length > 0 && (
                <div className={styles.group}>
                  <p className={styles.groupLabel}>Meals</p>
                  {filteredMeals.map(renderRow)}
                </div>
              )}
              {filteredItems.length > 0 && (
                <div className={styles.group}>
                  <p className={`${styles.groupLabel} ${styles.groupLabelItem}`}>Food Items</p>
                  {filteredItems.map(renderRow)}
                </div>
              )}
            </>
          )}
        </div>
      )}

      <BottomSheet open={!!selected} onClose={() => { setSelected(null); setQuantity(1); setNote('') }} title="Add to Log">
        {selected && (
          <div className={styles.sheetBody}>
            <p className={styles.sheetFoodName}>{selected.name}</p>

            <label className={styles.sheetLabel}>How many servings?</label>

            <input
              className={styles.quantityInput}
              type="number"
              inputMode="decimal"
              min="0.1"
              step="0.5"
              value={quantity || ''}
              onChange={e => handleQuantityInput(e.target.value)}
            />

            <div className={styles.quickAmounts}>
              {QUICK_AMOUNTS.map(q => (
                <button
                  key={q}
                  className={`${styles.quickBtn} ${quantity === q ? styles.quickBtnActive : ''}`}
                  onClick={() => setQuantity(q)}
                >
                  {q}
                </button>
              ))}
            </div>

            {preview && (
              <div className={styles.preview}>
                = {preview.calories} kcal · {preview.protein}g protein · {preview.carbs}g carbs · {preview.fat}g fat
              </div>
            )}

            <input
              className={styles.noteInput}
              type="text"
              placeholder="Add a note…"
              value={note}
              onChange={e => setNote(e.target.value)}
              maxLength={120}
            />

            <div className={styles.dateRow}>
              <label className={styles.dateLabel}>Date</label>
              <input
                className={styles.dateInput}
                type="date"
                value={date}
                max={formatDate(new Date())}
                onChange={e => setDate(e.target.value)}
              />
            </div>

            <button
              className={styles.addBtn}
              onClick={handleAdd}
              disabled={createLog.isPending || !quantity}
            >
              {createLog.isPending ? 'Adding…' : 'Add to Log'}
            </button>
          </div>
        )}
      </BottomSheet>
    </div>
  )
}
