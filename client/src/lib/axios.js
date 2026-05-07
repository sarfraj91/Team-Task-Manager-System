import axios from "axios"
import { clearStoredSession, getStoredToken, setStoredToken, setStoredUser } from "@/utils/storage"

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

export const authClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true
})

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true
})

apiClient.interceptors.request.use((config) => {
  const token = getStoredToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

let isRefreshing = false
let refreshSubscribers = []

const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback)
}

const onTokenRefreshed = (token) => {
  refreshSubscribers.forEach((callback) => callback(token))
  refreshSubscribers = []
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (
      error.response?.status !== 401 ||
      originalRequest?._retry ||
      originalRequest?.url?.includes("/auth/refresh")
    ) {
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise((resolve) => {
        subscribeTokenRefresh((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          resolve(apiClient(originalRequest))
        })
      })
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      const { data } = await authClient.get("/auth/refresh")
      const session = data.data

      setStoredToken(session.accessToken)
      setStoredUser(session.user)
      onTokenRefreshed(session.accessToken)
      originalRequest.headers.Authorization = `Bearer ${session.accessToken}`

      return apiClient(originalRequest)
    } catch (refreshError) {
      clearStoredSession()
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login"
      }
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)

