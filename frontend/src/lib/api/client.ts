import axios from 'axios'
import type { ApiError } from '@/types'

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    }
    const apiError: ApiError =
      error.response?.data?.error ?? {
        code: 'UNKNOWN',
        message: 'Something went wrong',
      }
    return Promise.reject(apiError)
  }
)

export default apiClient
