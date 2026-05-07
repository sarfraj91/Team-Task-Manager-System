import { apiClient } from "@/lib/axios"

export const getWorkspaces = async () => {
  const { data } = await apiClient.get("/workspaces")
  return data.data
}

export const getCurrentWorkspace = async () => {
  const { data } = await apiClient.get("/workspaces/current")
  return data.data
}

export const createWorkspace = async (payload) => {
  const { data } = await apiClient.post("/workspaces", payload)
  return data.data
}

export const switchWorkspace = async (workspaceId) => {
  const { data } = await apiClient.post(`/workspaces/${workspaceId}/switch`)
  return data.data
}
