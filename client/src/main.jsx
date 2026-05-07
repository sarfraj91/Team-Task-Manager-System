import React from "react"
import ReactDOM from "react-dom/client"
import { Toaster } from "sonner"
import App from "./App"
import { AuthProvider } from "./context/AuthContext"
import { ThemeProvider } from "./context/ThemeContext"
import "./styles/globals.css"

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <App />
        <Toaster
          richColors
          theme="dark"
          position="top-right"
          toastOptions={{
            className:
              "border border-white/10 bg-slate-950/90 text-slate-100 shadow-ambient backdrop-blur-xl"
          }}
        />
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
)

