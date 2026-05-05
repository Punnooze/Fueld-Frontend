import styles from './FoodCard.module.css'
import type { FoodItem } from '../api/foods'

interface Props {
  food: FoodItem
  onDelete?: (id: string) => void
  onEdit?: (food: FoodItem) => void
  onSelect?: (food: FoodItem) => void
  selected?: boolean
}

const TrashIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6M14 11v6M9 6V4h6v2"/>
  </svg>
)

const PencilIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
)

export const FoodCard = ({ food, onDelete, onEdit, onSelect, selected }: Props) => (
  <div
    className={`${styles.card} ${selected ? styles.selected : ''} ${onSelect ? styles.selectable : ''}`}
    onClick={() => onSelect?.(food)}
  >
    <div className={styles.info}>
      <span className={styles.name}>{food.name}</span>
      <div className={styles.chips}>
        <span className={styles.chip}>{food.calories} kcal</span>
        <span className={styles.chip}>P {food.protein}g</span>
        <span className={styles.chip}>C {food.carbs}g</span>
        <span className={styles.chip}>F {food.fat}g</span>
      </div>
    </div>
    {food.isCustom && (onEdit || onDelete) && (
      <div className={styles.actions}>
        {onEdit && (
          <button
            className={styles.editBtn}
            onClick={e => { e.stopPropagation(); onEdit(food) }}
            aria-label={`Edit ${food.name}`}
          >
            <PencilIcon />
          </button>
        )}
        {onDelete && (
          <button
            className={styles.deleteBtn}
            onClick={e => { e.stopPropagation(); onDelete(food.id) }}
            aria-label={`Delete ${food.name}`}
          >
            <TrashIcon />
          </button>
        )}
      </div>
    )}
  </div>
)
