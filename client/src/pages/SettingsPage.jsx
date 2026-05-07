import { Building2, Camera, MapPin, Save, ShieldCheck, UserRound, Users } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import PageHeader from "@/components/common/PageHeader"
import ThemeToggle from "@/components/common/ThemeToggle"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/hooks/useAuth"

const SettingsPage = () => {
  const { currentWorkspace, updateProfile, user } = useAuth()
  const [form, setForm] = useState({
    name: "",
    bio: "",
    location: ""
  })
  const [avatarFile, setAvatarFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setForm({
      name: user?.name || "",
      bio: user?.bio || "",
      location: user?.location || ""
    })
  }, [user])

  useEffect(() => {
    if (!avatarFile) {
      setPreviewUrl(user?.avatar || "")
      return undefined
    }

    const objectUrl = URL.createObjectURL(avatarFile)
    setPreviewUrl(objectUrl)

    return () => URL.revokeObjectURL(objectUrl)
  }, [avatarFile, user])

  const hasChanges = useMemo(
    () =>
      Boolean(
        avatarFile ||
          form.name !== (user?.name || "") ||
          form.bio !== (user?.bio || "") ||
          form.location !== (user?.location || "")
      ),
    [avatarFile, form, user]
  )

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({
      ...current,
      [name]: value
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (form.name.trim().length < 2) {
      toast.error("Name must be at least 2 characters")
      return
    }

    setIsSaving(true)
    try {
      await updateProfile({
        name: form.name.trim(),
        bio: form.bio,
        location: form.location,
        avatar: avatarFile || undefined
      })
      setAvatarFile(null)
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to update profile")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Account settings"
        title="Manage your profile and workspace appearance."
        description="Update your avatar, profile details, and theme from one place."
      />

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Your email stays fixed. Everything else here can be updated.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="surface-panel flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                <Avatar src={previewUrl} alt={form.name || user?.name} className="h-20 w-20 rounded-3xl" />
                <div className="flex-1 space-y-3">
                  <div>
                    <p className="headline text-2xl font-semibold">{form.name || user?.name}</p>
                    <p className="text-sm text-muted-foreground">{user?.role}</p>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Label
                      htmlFor="avatar-upload"
                      className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold transition hover:bg-white/10"
                    >
                      <Camera className="h-4 w-4" />
                      Change avatar
                    </Label>
                    <Input
                      id="avatar-upload"
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={(event) => setAvatarFile(event.target.files?.[0] || null)}
                    />
                    <p className="text-sm text-muted-foreground">PNG, JPG, or WEBP up to 2 MB.</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" name="name" value={form.name} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input id="email" value={user?.email || ""} disabled />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    name="location"
                    placeholder="Kolkata, India"
                    value={form.location}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input id="role" value={user?.role || ""} disabled />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  placeholder="Write a short note about what you own in the workspace."
                  value={form.bio}
                  onChange={handleChange}
                />
              </div>

              <Button type="submit" disabled={!hasChanges || isSaving}>
                <Save className="h-4 w-4" />
                Save profile
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account status</CardTitle>
              <CardDescription>Quick account details for the current user.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                [ShieldCheck, "Role", user?.role],
                [UserRound, "Verification", user?.isEmailVerified ? "Email verified" : "Pending verification"],
                [MapPin, "Location", user?.location || "Not added yet"]
              ].map(([Icon, label, value]) => (
                <div key={label} className="surface-panel p-4">
                  <Icon className="h-5 w-5 text-primary" />
                  <p className="mt-3 text-sm text-muted-foreground">{label}</p>
                  <p className="mt-2 font-semibold">{value}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Switch between dark and light mode.</CardDescription>
            </CardHeader>
            <CardContent className="surface-panel flex items-center justify-between p-5">
              <div>
                <p className="font-semibold">Theme</p>
                <p className="text-sm text-muted-foreground">Saved locally in this browser.</p>
              </div>
              <ThemeToggle />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Workspace</CardTitle>
              <CardDescription>Jump into your active team setup and member list.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="surface-panel p-4">
                <Building2 className="h-5 w-5 text-primary" />
                <p className="mt-3 text-sm text-muted-foreground">Current workspace</p>
                <p className="mt-2 font-semibold">{currentWorkspace?.name || "No workspace"}</p>
                <p className="text-sm text-muted-foreground">{currentWorkspace?.teamCode || "No team code"}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Button variant="secondary" asChild>
                  <Link to="/app/workspace">
                    <Building2 className="h-4 w-4" />
                    Workspace
                  </Link>
                </Button>
                <Button variant="secondary" asChild>
                  <Link to="/app/members">
                    <Users className="h-4 w-4" />
                    Members
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
