import { apiClient } from "@/lib/axios"

const multipartHeaders = (payload) =>
  payload instanceof FormData ? { "Content-Type": "multipart/form-data" } : undefined

export const getTasks = async (params = {}) => {
  const { data } = await apiClient.get("/tasks", { params })
  return data.data
}

export const getTask = async (taskId) => {
  const { data } = await apiClient.get(`/tasks/${taskId}`)
  return data.data
}

export const createTask = async (payload) => {
  const { data } = await apiClient.post("/tasks", payload, {
    headers: multipartHeaders(payload)
  })
  return data.data
}

export const updateTask = async (taskId, payload) => {
  const { data } = await apiClient.put(`/tasks/${taskId}`, payload)
  return data.data
}

export const submitTaskForReview = async (taskId, payload) => {
  const { data } = await apiClient.post(`/tasks/${taskId}/submit`, payload)
  return data.data
}

export const reviewTaskSubmission = async (taskId, payload) => {
  const { data } = await apiClient.post(`/tasks/${taskId}/review`, payload)
  return data.data
}

export const deleteTask = async (taskId) => {
  const { data } = await apiClient.delete(`/tasks/${taskId}`)
  return data
}

export const addTaskComment = async (taskId, payload) => {
  const { data } = await apiClient.post(`/tasks/${taskId}/comments`, payload)
  return data.data
}

export const uploadTaskAttachments = async (taskId, files) => {
  const formData = new FormData()
  Array.from(files || []).forEach((file) => formData.append("attachments", file))
  const { data } = await apiClient.post(`/tasks/${taskId}/attachments`, formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  })
  return data.data
}
