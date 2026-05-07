import { apiClient } from "@/lib/axios"

export const getDashboardOverview = async () => {
  const { data } = await apiClient.get("/dashboard/overview")
  return data.data
}

