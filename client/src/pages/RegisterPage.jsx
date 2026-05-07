import { MailCheck } from "lucide-react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import AuthForm from "@/components/forms/AuthForm"
import Logo from "@/components/common/Logo"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/hooks/useAuth"

const RegisterPage = () => {
  const navigate = useNavigate()
  const { completeRegistration, resendRegistrationCode, startRegistration } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [step, setStep] = useState("details")
  const [draft, setDraft] = useState({
    name: "",
    email: "",
    password: "",
    role: "admin",
    workspaceName: "",
    teamCode: ""
  })
  const [otp, setOtp] = useState("")

  const handleSubmit = async (values) => {
    setIsSubmitting(true)
    try {
      await startRegistration(values)
      setDraft(values)
      setStep("verify")
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to start signup")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleVerify = async (event) => {
    event.preventDefault()

    if (!/^\d{6}$/.test(otp.trim())) {
      toast.error("Enter the 6 digit code sent to your email")
      return
    }

    setIsSubmitting(true)
    try {
      await completeRegistration({
        email: draft.email,
        otp: otp.trim()
      })
      navigate("/app/dashboard", { replace: true })
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to verify email")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container grid min-h-screen items-center gap-10 py-8 ">
      {/* <div className="hidden lg:block">
        <div className="space-y-6 rounded-[36px] border border-white/10 bg-white/5 p-8 shadow-ambient backdrop-blur-2xl light:border-slate-200 light:bg-white/80">
          <Logo />
          <div className="space-y-4">
            <h1 className="headline text-5xl font-semibold">Create your account and verify it by email.</h1>
            <p className="max-w-lg text-lg text-muted-foreground">
              Pick your role, confirm the OTP, and start working with the same permissions you selected during signup.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["Role at signup", "Admin or member"],
              ["Email verification", "6 digit OTP"],
              ["Profile updates", "Name, avatar, bio, location"],
              ["Project access", "Based on selected role"]
            ].map(([label, value]) => (
              <div key={label} className="rounded-[24px] border border-white/10 bg-black/10 p-4 light:border-slate-200 light:bg-slate-900/5">
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="mt-2 font-semibold">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div> */}

      <Card className="mx-auto w-full max-w-xl">
        <div className="flex justify-start items-center p-4">
          <Logo />
        </div>
        <CardHeader>
          <CardTitle className="text-3xl">{step === "details" ? "Create your account" : "Verify your email"}</CardTitle>
          <CardDescription>
            {step === "details"
              ? "Create a workspace as admin or join an existing one with a team code as member."
              : `Enter the code sent to ${draft.email}.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "details" ? (
            <AuthForm
              mode="register"
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              defaultValues={draft}
            />
          ) : (
            <form onSubmit={handleVerify} className="space-y-5">
              <div className="rounded-[24px] border border-primary/20 bg-primary/10 p-4 text-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
                    <MailCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold">{draft.email}</p>
                    <p className="text-muted-foreground">
                      {draft.role === "admin"
                        ? `Workspace: ${draft.workspaceName || "New workspace"}`
                        : `Team code: ${draft.teamCode || "Pending"}`}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="otp">Verification code</Label>
                <Input
                  id="otp"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="123456"
                  value={otp}
                  onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))}
                />
              </div>

              <Button className="w-full" size="lg" type="submit" disabled={isSubmitting}>
                Verify and continue
              </Button>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  disabled={isSubmitting}
                  onClick={async () => {
                    setIsSubmitting(true)
                    try {
                      await resendRegistrationCode({ email: draft.email })
                    } catch (error) {
                      toast.error(error.response?.data?.message || "Unable to resend code")
                    } finally {
                      setIsSubmitting(false)
                    }
                  }}
                >
                  Resend code
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="flex-1"
                  disabled={isSubmitting}
                  onClick={() => setStep("details")}
                >
                  Edit details
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default RegisterPage
