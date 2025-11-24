import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
})

export const setAuthHeader = (token) => {
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`
  } else {
    delete apiClient.defaults.headers.common.Authorization
  }
}

const unwrap = (promise) => promise.then((response) => response.data)

export const refreshTokens = async (refreshToken) => {
  const data = await unwrap(
    apiClient.post('/api/auth/refresh', { refresh_token: refreshToken }),
  )
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
  }
}

export const userApi = {
  getProfile: () => unwrap(apiClient.get('/api/users/profile')),
  updateProfile: (payload) => unwrap(apiClient.put('/api/users/profile', payload)),
  submitQuiz: (payload) => unwrap(apiClient.post('/api/users/quiz', payload)),
}

export const mealApi = {
  today: () => unwrap(apiClient.get('/api/meals/today')),
  upcoming: (days = 7) => unwrap(apiClient.get('/api/meals/upcoming', { params: { days } })),
  confirmDelivery: (assignmentId) =>
    unwrap(apiClient.post(`/api/meals/${assignmentId}/confirm-delivery`)),
}

export const subscriptionApi = {
  listPlans: () => unwrap(apiClient.get('/api/subscriptions/plans')),
  subscribe: (planId) => unwrap(apiClient.post('/api/subscriptions/subscribe', { plan_id: planId })),
  current: () => unwrap(apiClient.get('/api/subscriptions/current')),
}

export const complaintApi = {
  list: () => unwrap(apiClient.get('/api/complaints')),
  create: (payload) => unwrap(apiClient.post('/api/complaints', payload)),
}

export const adminApi = {
  dashboard: () => unwrap(apiClient.get('/api/admin/dashboard')),
  customers: () => unwrap(apiClient.get('/api/admin/customers')),
  meals: () => unwrap(apiClient.get('/api/admin/meals')),
  createMeal: (payload) => unwrap(apiClient.post('/api/admin/meals', payload)),
  updateMeal: (mealId, payload) => unwrap(apiClient.put(`/api/admin/meals/${mealId}`, payload)),
  complaints: () => unwrap(apiClient.get('/api/admin/complaints')),
  resolveComplaint: (complaintId) =>
    unwrap(apiClient.put(`/api/admin/complaints/${complaintId}/resolve`)),
}

