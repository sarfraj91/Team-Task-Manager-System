import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export const cn = (...inputs) => twMerge(clsx(inputs))

export const formatDate = (value, options = {}) => {
  if (!value) {
    return "No date"
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...options
  }).format(new Date(value))
}

export const formatRelativeTime = (value) => {
  if (!value) {
    return "just now"
  }

  const date = new Date(value)
  const seconds = Math.round((date.getTime() - Date.now()) / 1000)
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" })
  const divisions = [
    { amount: 60, unit: "seconds" },
    { amount: 60, unit: "minutes" },
    { amount: 24, unit: "hours" },
    { amount: 7, unit: "days" },
    { amount: 4.34524, unit: "weeks" },
    { amount: 12, unit: "months" },
    { amount: Number.POSITIVE_INFINITY, unit: "years" }
  ]

  let duration = seconds

  for (const division of divisions) {
    if (Math.abs(duration) < division.amount) {
      return formatter.format(Math.round(duration), division.unit)
    }

    duration /= division.amount
  }

  return "just now"
}

export const getInitials = (name = "") =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

export const isOverdue = (task) =>
  Boolean(task?.dueDate && new Date(task.dueDate) < new Date() && task.status !== "done")

export const getPriorityTone = (priority) =>
  ({
    low: "bg-emerald-500/15 text-emerald-300 border-emerald-500/20",
    medium: "bg-blue-500/15 text-blue-300 border-blue-500/20",
    high: "bg-orange-500/15 text-orange-300 border-orange-500/20",
    urgent: "bg-rose-500/15 text-rose-300 border-rose-500/20"
  }[priority] || "bg-slate-500/15 text-slate-300 border-slate-500/20")

export const getStatusTone = (status) =>
  ({
    backlog: "bg-slate-500/15 text-slate-300 border-slate-500/20",
    todo: "bg-cyan-500/15 text-cyan-300 border-cyan-500/20",
    "in-progress": "bg-amber-500/15 text-amber-300 border-amber-500/20",
    review: "bg-violet-500/15 text-violet-300 border-violet-500/20",
    done: "bg-emerald-500/15 text-emerald-300 border-emerald-500/20"
  }[status] || "bg-slate-500/15 text-slate-300 border-slate-500/20")

export const getProgressValue = (completed, total) => {
  if (!total) {
    return 0
  }

  return Math.round((completed / total) * 100)
}

export const buildTaskPayload = (values) => {
  const hasFiles = values.attachments?.length

  if (!hasFiles) {
    return {
      ...values,
      tags: values.tags
        ?.split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
    }
  }

  const formData = new FormData()
  Object.entries(values).forEach(([key, value]) => {
    if (key === "attachments") {
      Array.from(value || []).forEach((file) => formData.append("attachments", file))
      return
    }

    if (key === "tags") {
      formData.append(
        "tags",
        JSON.stringify(
          String(value)
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        )
      )
      return
    }

    if (value !== undefined && value !== null && value !== "") {
      formData.append(key, value)
    }
  })

  return formData
}

