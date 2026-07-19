import { useState } from 'react'
import { EditIcon, TrashIcon, MoreIcon } from '../assets/icons'
import type { FoodItem } from '../api/foods'
import styles from './FoodCard.module.css'

interface Props {
  food: FoodItem
  onDelete?: (id: string) => void
  onEdit?: (food: FoodItem) => void
  onSelect?: (food: FoodItem) => void
  selected?: boolean
}

export const FoodCard = ({ food, onDelete, onEdit, onSelect, selected }: Props) => {
  const [actionsOpen, setActionsOpen] = useState(false)
  const hasActions = onEdit || onDelete

  return (
    <div
      className={`card ${styles.foodCard} ${selected ? styles.selected : ''} ${onSelect ? styles.selectable : ''}`}
      onClick={() => onSelect?.(food)}
    >
      <div className="stack gap-4 flex-1 min-w-0">
        <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-hi)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {food.name}
        </span>
        <div className="row gap-4 wrap">
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />
          <span className="t-meta">{food.calories} kcal</span>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--protein)', flexShrink: 0 }} />
          <span className="t-meta">{food.protein}g P</span>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--carbs)', flexShrink: 0 }} />
          <span className="t-meta">{food.carbs}g C</span>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--fat)', flexShrink: 0 }} />
          <span className="t-meta">{food.fat}g F</span>
        </div>
      </div>

      {hasActions && (
        <div>
          {actionsOpen ? (
            <div className="row gap-6">
              {onEdit && (
                <button className="btn-icon" onClick={e => { e.stopPropagation(); onEdit(food); setActionsOpen(false) }}>
                  <EditIcon width={15} height={15} />
                </button>
              )}
              {onDelete && (
                <button className="btn-danger" onClick={e => { e.stopPropagation(); onDelete(food.id); setActionsOpen(false) }}>
                  <TrashIcon width={15} height={15} />
                </button>
              )}
            </div>
          ) : (
            <button className="btn-icon" onClick={e => { e.stopPropagation(); setActionsOpen(true) }}>
              <MoreIcon width={16} height={16} />
            </button>
          )}
        </div>
      )}
    </div>
  )
}
