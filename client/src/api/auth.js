import { apiClient, authClient } from "@/lib/axios"

export const requestRegisterOtp = async (payload) => {
  const { data } = await authClient.post("/auth/register/request-otp", payload)
  return data
}

export const verifyRegisterOtp = async (payload) => {
  const { data } = await authClient.post("/auth/register/verify-otp", payload)
  return data.data
}

export const resendRegisterOtp = async (payload) => {
  const { data } = await authClient.post("/auth/register/resend-otp", payload)
  return data
}

export const loginRequest = async (payload) => {
  const { data } = await authClient.post("/auth/login", payload)
  return data.data
}

export const refreshRequest = async () => {
  const { data } = await authClient.get("/auth/refresh")
  return data.data
}

export const logoutRequest = async () => {
  const { data } = await authClient.post("/auth/logout")
  return data
}

export const meRequest = async () => {
  const { data } = await apiClient.get("/auth/me")
  return data.data
}
