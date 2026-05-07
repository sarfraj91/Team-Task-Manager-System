import { createContext, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import {
  loginRequest,
  logoutRequest,
  meRequest,
  refreshRequest,
  requestRegisterOtp,
  resendRegisterOtp,
  verifyRegisterOtp
} from "@/api/auth"
import { updateProfile as updateProfileRequest } from "@/api/users"
import {
  createWorkspace as createWorkspaceRequest,
  switchWorkspace as switchWorkspaceRequest
} from "@/api/workspaces"
import { clearStoredSession, getStoredToken, getStoredUser, setStoredToken, setStoredUser } from "@/utils/storage"

export const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser())
  const [isLoading, setIsLoading] = useState(true)
  const currentWorkspace = user?.workspace || null

  const applySession = (session) => {
    setUser(session.user)
    setStoredToken(session.accessToken)
    setStoredUser(session.user)
  }

  const clearSession = () => {
    setUser(null)
    clearStoredSession()
  }

  const bootstrapSession = async () => {
    try {
      if (getStoredToken()) {
        const currentUser = await meRequest()
        setUser(currentUser)
        setStoredUser(currentUser)
      } else {
        const session = await refreshRequest()
        applySession(session)
      }
    } catch (_error) {
      clearSession()
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    bootstrapSession()
  }, [])

  const login = async (payload) => {
    const session = await loginRequest(payload)
    applySession(session)
    toast.success("Signed in successfully")
    return session
  }

  const startRegistration = async (payload) => {
    const response = await requestRegisterOtp(payload)
    toast.success(response.message || "Verification code sent")
    return response
  }

  const completeRegistration = async (payload) => {
    const session = await verifyRegisterOtp(payload)
    applySession(session)
    toast.success("Account verified successfully")
    return session
  }

  const resendRegistrationCode = async (payload) => {
    const response = await resendRegisterOtp(payload)
    toast.success(response.message || "Verification code sent")
    return response
  }

  const updateProfile = async (payload) => {
    const updatedUser = await updateProfileRequest(payload)
    setUser(updatedUser)
    setStoredUser(updatedUser)
    toast.success("Profile updated")
    return updatedUser
  }

  const createWorkspace = async (payload) => {
    const session = await createWorkspaceRequest(payload)
    applySession(session)
    toast.success("Workspace created successfully")
    return session
  }

  const switchWorkspace = async (workspaceId) => {
    const session = await switchWorkspaceRequest(workspaceId)
    applySession(session)
    toast.success("Workspace switched successfully")
    return session
  }

  const logout = async () => {
    try {
      await logoutRequest()
    } finally {
      clearSession()
      toast.success("You have been logged out")
    }
  }

  const value = useMemo(
    () => ({
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === "admin",
      isLoading,
      completeRegistration,
      createWorkspace,
      currentWorkspace,
      login,
      logout,
      resendRegistrationCode,
      startRegistration,
      switchWorkspace,
      updateProfile,
      user
    }),
    [currentWorkspace, isLoading, user]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
