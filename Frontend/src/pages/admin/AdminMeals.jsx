import { useEffect, useState } from 'react'

import { adminApi } from '../../services/api.js'

const defaultForm = {
  name: '',
  meal_type: 'LUNCH',
  description: '',
  ingredients: '',
  calories: 500,
  protein_g: 30,
  carbs_g: 45,
  fats_g: 15,
  dietary_tags: '',
  is_vegetarian: true,
  spice_level: 'MEDIUM',
}

function AdminMeals() {
  const [meals, setMeals] = useState([])
  const [form, setForm] = useState(defaultForm)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const loadMeals = async () => {
    try {
      setLoading(true)
      const data = await adminApi.meals()
      setMeals(data)
    } catch (err) {
      setError(err?.response?.data?.detail || 'Unable to load meals.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMeals()
  }, [])

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await adminApi.createMeal({
        name: form.name,
        description: form.description,
        meal_type: form.meal_type,
        ingredients: form.ingredients.split(',').map((item) => item.trim()).filter(Boolean),
        calories: Number(form.calories),
        protein_g: Number(form.protein_g),
        carbs_g: Number(form.carbs_g),
        fats_g: Number(form.fats_g),
        dietary_tags: form.dietary_tags.split(',').map((item) => item.trim()).filter(Boolean),
        is_vegetarian: form.is_vegetarian,
        spice_level: form.spice_level,
        is_active: true,
      })
      setForm(defaultForm)
      await loadMeals()
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to create meal.')
    } finally {
      setSubmitting(false)
    }
  }

  const toggleActive = async (meal) => {
    await adminApi.updateMeal(meal.id, { is_active: !meal.is_active })
    await loadMeals()
  }

  if (loading) {
    return <p>Loading meals...</p>
  }

  return (
    <div>
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3>Create new meal</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="input-control">
              <label className="input-label">Meal name</label>
              <input
                className="input-field"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
              />
            </div>
            <div className="input-control">
              <label className="input-label">Type</label>
              <select
                className="select-field"
                value={form.meal_type}
                onChange={(e) => handleChange('meal_type', e.target.value)}
              >
                <option>BREAKFAST</option>
                <option>LUNCH</option>
                <option>DINNER</option>
                <option>SNACK</option>
              </select>
            </div>
            <div className="input-control">
              <label className="input-label">Spice level</label>
              <select
                className="select-field"
                value={form.spice_level}
                onChange={(e) => handleChange('spice_level', e.target.value)}
              >
                <option>MILD</option>
                <option>MEDIUM</option>
                <option>HOT</option>
              </select>
            </div>
            <div className="input-control">
              <label className="input-label">Is vegetarian?</label>
              <select
                className="select-field"
                value={form.is_vegetarian ? 'yes' : 'no'}
                onChange={(e) => handleChange('is_vegetarian', e.target.value === 'yes')}
              >
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
          </div>

          <div className="input-control">
            <label className="input-label">Description</label>
            <textarea
              className="textarea-field"
              rows={3}
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
            />
          </div>

          <div className="form-grid">
            <div className="input-control">
              <label className="input-label">Ingredients (comma separated)</label>
              <input
                className="input-field"
                value={form.ingredients}
                onChange={(e) => handleChange('ingredients', e.target.value)}
              />
            </div>
            <div className="input-control">
              <label className="input-label">Tags (comma separated)</label>
              <input
                className="input-field"
                value={form.dietary_tags}
                onChange={(e) => handleChange('dietary_tags', e.target.value)}
              />
            </div>
          </div>

          <div className="form-grid">
            {['calories', 'protein_g', 'carbs_g', 'fats_g'].map((macro) => (
              <div key={macro} className="input-control">
                <label className="input-label">{macro.replace('_g', '').toUpperCase()}</label>
                <input
                  type="number"
                  className="input-field"
                  value={form[macro]}
                  onChange={(e) => handleChange(macro, e.target.value)}
                  required
                />
              </div>
            ))}
          </div>

          {error && <p style={{ color: '#ff6b6b' }}>{error}</p>}
          <button className="btn-primary" type="submit" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create meal'}
          </button>
        </form>
      </div>

      <div className="card">
        <h3>Catalog</h3>
        <div className="table-scroll">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Calories</th>
                <th>Vegetarian</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {meals.map((meal) => (
                <tr key={meal.id}>
                  <td>{meal.name}</td>
                  <td>{meal.meal_type}</td>
                  <td>{meal.calories} kcal</td>
                  <td>{meal.is_vegetarian ? 'Yes' : 'No'}</td>
                  <td>
                    <span className={`badge ${meal.is_active ? 'success' : 'neutral'}`}>
                      {meal.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <button className="btn-ghost" onClick={() => toggleActive(meal)}>
                      {meal.is_active ? 'Pause' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AdminMeals

