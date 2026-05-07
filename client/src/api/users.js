import { apiClient } from "@/lib/axios"

export const getTeamMembers = async () => {
  const { data } = await apiClient.get("/users/team")
  return data.data
}

export const updateProfile = async (payload) => {
  const formData = new FormData()

  ;["name", "bio", "location"].forEach((field) => {
    if (payload[field] !== undefined) {
      formData.append(field, payload[field])
    }
  })

  if (payload.avatar) {
    formData.append("avatar", payload.avatar)
  }

  const { data } = await apiClient.put("/users/profile", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  })

  return data.data
}
