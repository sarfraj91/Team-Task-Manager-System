import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff, LoaderCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { Link } from "react-router-dom"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { roleOptions } from "@/lib/constants"

const registerSchemaFields = {
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
  role: z.enum(["admin", "member"], {
    required_error: "Choose either admin or member",
    invalid_type_error: "Choose either admin or member"
  }),
  workspaceName: z.string().max(80, "Workspace name can be up to 80 characters").optional(),
  teamCode: z.string().max(20, "Team code can be up to 20 characters").optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, "Use uppercase, lowercase, and a number")
}

const registerSchema = z
  .object(registerSchemaFields)
  .superRefine((value, context) => {
    if (value.role === "admin" && !value.workspaceName?.trim()) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Workspace name is required for admin signup",
        path: ["workspaceName"]
      })
    }

    if (value.role === "member") {
      if (!value.teamCode?.trim()) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Team code is required for member signup",
          path: ["teamCode"]
        })
      } else if (!/^[A-Z0-9-]{6,20}$/i.test(value.teamCode.trim())) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Enter a valid team code",
          path: ["teamCode"]
        })
      }
    }
  })

const loginSchema = z.object(registerSchemaFields).omit({
  name: true,
  role: true,
  workspaceName: true,
  teamCode: true
})

const AuthForm = ({ mode = "login", onSubmit, isSubmitting, defaultValues }) => {
  const [showPassword, setShowPassword] = useState(false)
  const schema = mode === "login" ? loginSchema : registerSchema
  const {
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "admin",
      workspaceName: "",
      teamCode: "",
      ...defaultValues
    }
  })

  useEffect(() => {
    reset({
      name: "",
      email: "",
      password: "",
      role: "admin",
      workspaceName: "",
      teamCode: "",
      ...defaultValues
    })
  }, [defaultValues, reset])

  const selectedRole = watch("role")

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {mode === "register" ? (
        <>
          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" placeholder="Ariana Patel" {...register("name")} />
            {errors.name ? <p className="text-sm text-rose-300">{errors.name.message}</p> : null}
          </div>

          <div className="space-y-3">
            <Label>Choose your role</Label>
            <div className="grid gap-3 sm:grid-cols-2">
              {roleOptions.map((option) => {
                const Icon = option.icon

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setValue("role", option.value, { shouldValidate: true })}
                    className={`rounded-[24px] border p-4 text-left transition ${
                      selectedRole === option.value
                        ? "border-primary/60 bg-primary/10 shadow-lg shadow-primary/10"
                        : "border-white/10 bg-white/5 hover:bg-white/10 light:border-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 light:bg-slate-900/5">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold">{option.label}</p>
                        <p className="text-sm text-muted-foreground">
                          {option.value === "admin" ? "Create projects and assign work" : "Work on assigned tasks"}
                        </p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
            {errors.role ? <p className="text-sm text-rose-300">{errors.role.message}</p> : null}
          </div>
        </>
      ) : null}

      {mode === "register" ? (
        <div className="space-y-2">
          {selectedRole === "admin" ? (
            <>
              <Label htmlFor="workspaceName">Workspace name</Label>
              <Input
                id="workspaceName"
                placeholder="Product Delivery Team"
                {...register("workspaceName")}
              />
              {errors.workspaceName ? (
                <p className="text-sm text-rose-300">{errors.workspaceName.message}</p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Your first team workspace and team code will be created from this name.
                </p>
              )}
            </>
          ) : (
            <>
              <Label htmlFor="teamCode">Team code</Label>
              <Input id="teamCode" placeholder="TEAM-X92A" {...register("teamCode")} />
              {errors.teamCode ? (
                <p className="text-sm text-rose-300">{errors.teamCode.message}</p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Ask your admin for the team code, then you will join that workspace after email verification.
                </p>
              )}
            </>
          )}
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="email">Email address</Label>
        <Input id="email" type="email" placeholder="team@taskflow.dev" {...register("email")} />
        {errors.email ? <p className="text-sm text-rose-300">{errors.email.message}</p> : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            className="pr-12"
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password ? <p className="text-sm text-rose-300">{errors.password.message}</p> : null}
      </div>

      <Button className="w-full" size="lg" type="submit" disabled={isSubmitting}>
        {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
        {mode === "login" ? "Sign in" : "Continue"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        {mode === "login" ? "Need an account?" : "Already have an account?"}{" "}
        <Link className="font-semibold text-primary" to={mode === "login" ? "/register" : "/login"}>
          {mode === "login" ? "Create one" : "Sign in"}
        </Link>
      </p>
    </form>
  )
}

export default AuthForm
