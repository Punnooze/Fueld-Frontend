import { useState } from 'react'
import { useFoods, useCreateFood, useUpdateFood, useDeleteFood } from '../hooks/useFoods'
import { FoodCard } from '../components/FoodCard'
import { BottomSheet } from '../components/BottomSheet'
import { useToast } from '../components/Toast'
import type { FoodItem } from '../api/foods'
import styles from './Foods.module.css'

interface FormState {
  name: string
  calories: string
  protein: string
  carbs: string
  fat: string
}

const EMPTY_FORM: FormState = { name: '', calories: '', protein: '', carbs: '', fat: '' }

type Tab = 'meal' | 'item'
type SheetMode = { mode: 'add' } | { mode: 'edit'; food: FoodItem }

export const Foods = () => {
  const { data: foods = [], isLoading, isError } = useFoods()
  const createFood = useCreateFood()
  const updateFood = useUpdateFood()
  const deleteFood = useDeleteFood()
  const { showToast } = useToast()

  const [activeTab, setActiveTab] = useState<Tab>('meal')
  const [sheet, setSheet] = useState<SheetMode | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [errors, setErrors] = useState<Partial<FormState>>({})

  const mealsCustom = foods.filter(f => f.isCustom && f.type === 'meal')
  const mealsLibrary = foods.filter(f => !f.isCustom && f.type === 'meal')
  const itemsCustom = foods.filter(f => f.isCustom && f.type === 'item')
  const itemsLibrary = foods.filter(f => !f.isCustom && f.type === 'item')

  const activeCustom = activeTab === 'meal' ? mealsCustom : itemsCustom
  const activeLibrary = activeTab === 'meal' ? mealsLibrary : itemsLibrary
  const isEmpty = !isLoading && !isError && activeCustom.length === 0 && activeLibrary.length === 0

  const openAdd = () => {
    setForm(EMPTY_FORM)
    setErrors({})
    setSheet({ mode: 'add' })
  }

  const openEdit = (food: FoodItem) => {
    setForm({
      name: food.name,
      calories: String(food.calories),
      protein: String(food.protein),
      carbs: String(food.carbs),
      fat: String(food.fat),
    })
    setErrors({})
    setSheet({ mode: 'edit', food })
  }

  const closeSheet = () => setSheet(null)

  const validate = (): boolean => {
    const errs: Partial<FormState> = {}
    if (!form.name.trim()) errs.name = 'Name is required'
    const nums: (keyof FormState)[] = ['calories', 'protein', 'carbs', 'fat']
    for (const k of nums) {
      const v = parseFloat(form[k])
      if (isNaN(v) || v < 0) errs[k] = '≥ 0'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    const payload = {
      name: form.name.trim(),
      calories: parseFloat(form.calories),
      protein: parseFloat(form.protein),
      carbs: parseFloat(form.carbs),
      fat: parseFloat(form.fat),
      type: activeTab,
    }
    try {
      if (sheet?.mode === 'edit') {
        await updateFood.mutateAsync({ id: sheet.food.id, payload })
        showToast('Updated!')
      } else {
        await createFood.mutateAsync(payload)
        showToast(activeTab === 'meal' ? 'Meal added!' : 'Food item added!')
      }
      closeSheet()
    } catch {
      showToast('Failed to save', 'error')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteFood.mutateAsync(id)
      showToast('Deleted')
    } catch {
      showToast('Failed to delete', 'error')
    }
  }

  const isPending = createFood.isPending || updateFood.isPending
  const sheetTitle = sheet?.mode === 'edit'
    ? `Edit ${activeTab === 'meal' ? 'Meal' : 'Food Item'}`
    : `Add ${activeTab === 'meal' ? 'Meal' : 'Food Item'}`

  const field = (key: keyof FormState, label: string, inputProps?: React.InputHTMLAttributes<HTMLInputElement>) => (
    <div key={key} className={styles.fieldWrap}>
      <label className={styles.fieldLabel}>{label}</label>
      <input
        className={`${styles.fieldInput} ${errors[key] ? styles.fieldError : ''}`}
        value={form[key]}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        {...inputProps}
      />
      {errors[key] && <span className={styles.errorMsg}>{errors[key]}</span>}
    </div>
  )

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Meals</h1>
      </header>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'meal' ? styles.tabMealActive : ''}`}
          onClick={() => setActiveTab('meal')}
        >
          Meals
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'item' ? styles.tabItemActive : ''}`}
          onClick={() => setActiveTab('item')}
        >
          Food Items
        </button>
      </div>

      {isLoading && (
        <div className={styles.skeleton}>
          {[1, 2, 3].map(i => <div key={i} className={styles.skeletonRow} />)}
        </div>
      )}

      {isError && <p className={styles.error}>Failed to load.</p>}

      {isEmpty && (
        <div className={styles.empty}>
          <p>No {activeTab === 'meal' ? 'meals' : 'food items'} yet.</p>
          <p className={styles.emptyHint}>Tap + to add one.</p>
        </div>
      )}

      {!isLoading && !isError && (
        <div className={styles.content}>
          {activeCustom.length > 0 && (
            <section className={styles.section}>
              <h2 className={styles.sectionLabel}>Your Custom {activeTab === 'meal' ? 'Meals' : 'Food Items'}</h2>
              <div className={styles.list}>
                {activeCustom.map(f => (
                  <FoodCard key={f.id} food={f} onEdit={openEdit} onDelete={handleDelete} />
                ))}
              </div>
            </section>
          )}

          {activeLibrary.length > 0 && (
            <section className={styles.section}>
              <h2 className={styles.sectionLabel}>Library</h2>
              <div className={styles.list}>
                {activeLibrary.map(f => (
                  <FoodCard key={f.id} food={f} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      <button className={`${styles.fab} ${activeTab === 'item' ? styles.fabItem : ''}`} onClick={openAdd}>
        <span className={styles.fabPlus}>+</span>
        <span>{activeTab === 'meal' ? 'Add Meal' : 'Add Food Item'}</span>
      </button>

      <BottomSheet open={!!sheet} onClose={closeSheet} title={sheetTitle}>
        <div className={styles.formBody}>
          {field('name', 'Name', { type: 'text', placeholder: activeTab === 'meal' ? 'e.g. Chicken & Rice' : 'e.g. Greek Yogurt', autoCapitalize: 'words' })}
          <div className={styles.row}>
            {field('calories', 'Calories', { type: 'number', inputMode: 'decimal', placeholder: '0', min: '0' })}
            {field('protein', 'Protein (g)', { type: 'number', inputMode: 'decimal', placeholder: '0', min: '0' })}
          </div>
          <div className={styles.row}>
            {field('carbs', 'Carbs (g)', { type: 'number', inputMode: 'decimal', placeholder: '0', min: '0' })}
            {field('fat', 'Fat (g)', { type: 'number', inputMode: 'decimal', placeholder: '0', min: '0' })}
          </div>
          <button className={styles.submitBtn} onClick={handleSubmit} disabled={isPending}>
            {isPending ? 'Saving…' : sheet?.mode === 'edit' ? 'Save Changes' : `Add ${activeTab === 'meal' ? 'Meal' : 'Food Item'}`}
          </button>
        </div>
      </BottomSheet>
    </div>
  )
}
