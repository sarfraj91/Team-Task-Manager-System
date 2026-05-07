import { apiClient } from "@/lib/axios"

export const getProjects = async (params = {}) => {
  const { data } = await apiClient.get("/projects", { params })
  return data.data
}

export const getProjectById = async (projectId) => {
  const { data } = await apiClient.get(`/projects/${projectId}`)
  return data.data
}

export const createProject = async (payload) => {
  const { data } = await apiClient.post("/projects", payload)
  return data.data
}

export const updateProject = async (projectId, payload) => {
  const { data } = await apiClient.put(`/projects/${projectId}`, payload)
  return data.data
}

export const deleteProject = async (projectId) => {
  const { data } = await apiClient.delete(`/projects/${projectId}`)
  return data
}

