import { useState } from 'react'
import { useFoods, useCreateFood, useUpdateFood, useDeleteFood } from '../hooks/useFoods'
import { FoodCard } from '../components/FoodCard'
import { BottomSheet } from '../components/BottomSheet'
import { SegmentedControl } from '../components/SegmentedControl'
import { FAB } from '../components/FAB'
import { Eyebrow } from '../components/ui/Eyebrow'
import { useToast } from '../components/Toast'
import EmptyMeals from '../assets/illustrations/empty-meals.svg?react'
import type { FoodItem } from '../api/foods'

interface FormState { name: string; calories: string; protein: string; carbs: string; fat: string }
const EMPTY_FORM: FormState = { name: '', calories: '', protein: '', carbs: '', fat: '' }
type Tab = 'meal' | 'item'
type SheetMode = { mode: 'add' } | { mode: 'edit'; food: FoodItem }

const TABS = [
  { value: 'meal', label: 'Meals' },
  { value: 'item', label: 'Food Items' },
]

const FormField = ({
  label, value, error, onChange, inputProps,
}: {
  label: string; value: string; error?: string;
  onChange: (v: string) => void;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>
}) => (
  <div className="stack gap-5" style={{marginBottom: 10, marginRight: 10}}>
    <label className="t-eyebrow" style={{marginBottom: 10}}>{label}</label>
    <input
      className={`input ${error ? 'input-error' : ''}`}
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{marginRight: 10}}
      {...inputProps}
    />
    {error && <span style={{ fontSize: 11, color: 'var(--danger)' }}>{error}</span>}
  </div>
)

export const Foods = () => {
  const { data: foods = [], isLoading, isError } = useFoods()
  const createFood = useCreateFood()
  const updateFood = useUpdateFood()
  const deleteFood = useDeleteFood()
  const { showToast } = useToast()

  const [activeTab, setActiveTab] = useState<Tab>('meal')
  const [sheet, setSheet]         = useState<SheetMode | null>(null)
  const [form, setForm]           = useState<FormState>(EMPTY_FORM)
  const [errors, setErrors]       = useState<Partial<FormState>>({})

  const items = foods.filter(f => f.type === activeTab)
  const isEmpty = !isLoading && !isError && items.length === 0

  const openAdd  = () => { setForm(EMPTY_FORM); setErrors({}); setSheet({ mode: 'add' }) }
  const openEdit = (food: FoodItem) => {
    setForm({ name: food.name, calories: String(food.calories), protein: String(food.protein), carbs: String(food.carbs), fat: String(food.fat) })
    setErrors({})
    setSheet({ mode: 'edit', food })
  }

  const validate = () => {
    const errs: Partial<FormState> = {}
    if (!form.name.trim()) errs.name = 'Required'
    for (const k of ['calories', 'protein', 'carbs', 'fat'] as const) {
      if (isNaN(parseFloat(form[k])) || parseFloat(form[k]) < 0) errs[k] = '≥ 0'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    const payload = { name: form.name.trim(), calories: parseFloat(form.calories), protein: parseFloat(form.protein), carbs: parseFloat(form.carbs), fat: parseFloat(form.fat), type: activeTab }
    try {
      if (sheet?.mode === 'edit') { await updateFood.mutateAsync({ id: sheet.food.id, payload }); showToast('Updated!') }
      else { await createFood.mutateAsync(payload); showToast(activeTab === 'meal' ? 'Meal added!' : 'Item added!') }
      setSheet(null)
    } catch { showToast('Failed to save', 'error') }
  }

  const handleDelete = async (id: string) => {
    try { await deleteFood.mutateAsync(id); showToast('Deleted') }
    catch { showToast('Failed to delete', 'error') }
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="t-h1">Meals</h1>
      </header>

      <div style={{ padding: '0 var(--page-x) 16px' }}>
        <SegmentedControl options={TABS} value={activeTab} onChange={v => setActiveTab(v as Tab)} />
      </div>

      {isLoading && (
        <div className="stack gap-8 px">
          {[1, 2, 3].map(i => <div key={i} className="skeleton-row" style={{ height: 68 }} />)}
        </div>
      )}

      {isError && <p style={{ color: 'var(--danger)', fontSize: 14, padding: 16, textAlign: 'center' }}>Failed to load.</p>}

      {isEmpty && (
        <div className="empty-state">
          <EmptyMeals width={200} height={200} />
          <p style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--text-hi)' }}>
            {activeTab === 'meal' ? 'Build your first meal' : 'Add your first food item'}
          </p>
          <p className="t-meta" style={{ maxWidth: 280 }}>
            {activeTab === 'meal'
              ? 'Combine food items you eat together — log them in one tap later.'
              : 'Add ingredients and snacks to your personal library.'}
          </p>
          <button className="btn-primary" style={{ width: 'auto', padding: '0 28px', borderRadius: 'var(--r-pill)' }} onClick={openAdd}>
            {activeTab === 'meal' ? 'Create meal' : 'Add food item'}
          </button>
        </div>
      )}

      {!isLoading && !isError && !isEmpty && (
        <div className="stack" style={{ padding: '0 var(--page-x)', gap: 24 }}>
          <div>
            <Eyebrow>Your {activeTab === 'meal' ? 'Meals' : 'Food'}</Eyebrow>
            <div className="stack gap-6">
              {items.map(f => <FoodCard key={f.id} food={f} onEdit={openEdit} onDelete={handleDelete} />)}
            </div>
          </div>
        </div>
      )}

      <FAB onClick={openAdd} label={activeTab === 'meal' ? 'Add meal' : 'Add food item'} />

      <BottomSheet
        open={!!sheet}
        onClose={() => setSheet(null)}
        title={sheet?.mode === 'edit' ? `Edit ${activeTab === 'meal' ? 'Meal' : 'Food Item'}` : `Add ${activeTab === 'meal' ? 'Meal' : 'Food Item'}`}
      >
        <div className="stack gap-12" >
          <FormField label="Name" value={form.name} error={errors.name}  onChange={v => setForm(f => ({ ...f, name: v }))}
            inputProps={{ type: 'text', placeholder: activeTab === 'meal' ? 'e.g. Chicken & Rice' : 'e.g. Greek Yogurt', autoCapitalize: 'words' }} />
          <div className="row gap-10">
            <FormField label="Calories" value={form.calories} error={errors.calories} onChange={v => setForm(f => ({ ...f, calories: v }))}
              inputProps={{ type: 'number', inputMode: 'decimal', placeholder: '0', min: '0' }} />
            <FormField label="Protein g" value={form.protein} error={errors.protein} onChange={v => setForm(f => ({ ...f, protein: v }))}
              inputProps={{ type: 'number', inputMode: 'decimal', placeholder: '0', min: '0' }} />
          </div>
          <div className="row gap-10">
            <FormField label="Carbs g" value={form.carbs} error={errors.carbs} onChange={v => setForm(f => ({ ...f, carbs: v }))}
              inputProps={{ type: 'number', inputMode: 'decimal', placeholder: '0', min: '0' }} />
            <FormField label="Fat g" value={form.fat} error={errors.fat} onChange={v => setForm(f => ({ ...f, fat: v }))}
              inputProps={{ type: 'number', inputMode: 'decimal', placeholder: '0', min: '0' }} />
          </div>
          <button className="btn-primary" onClick={handleSubmit} disabled={createFood.isPending || updateFood.isPending} style={{ marginTop: 4 }}>
            {createFood.isPending || updateFood.isPending ? 'Saving…' : sheet?.mode === 'edit' ? 'Save Changes' : `Add ${activeTab === 'meal' ? 'Meal' : 'Food Item'}`}
          </button>
        </div>
      </BottomSheet>
    </div>
  )
}
