const Workspace = require("../models/Workspace")

const randomChunk = () => Math.random().toString(36).slice(2, 6).toUpperCase()

const sanitizePrefix = (name = "") => {
  const letters = String(name)
    .replace(/[^a-zA-Z0-9 ]/g, " ")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.slice(0, 3).toUpperCase())
    .join("")

  return letters || "TEAM"
}

const generateUniqueTeamCode = async (workspaceName) => {
  const prefix = sanitizePrefix(workspaceName)

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const teamCode = `${prefix}-${randomChunk()}`
    const exists = await Workspace.exists({ teamCode })

    if (!exists) {
      return teamCode
    }
  }

  throw new Error("Unable to generate a unique team code")
}

module.exports = {
  generateUniqueTeamCode
}
