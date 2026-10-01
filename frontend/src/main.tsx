import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "@fontsource/chakra-petch/400.css"
import "@fontsource/chakra-petch/500.css"
import "@fontsource/chakra-petch/600.css"
import "@fontsource/chakra-petch/700.css"
import "@fontsource/gowun-batang/400.css"
import "@fontsource/gowun-batang/700.css"
import "@fontsource-variable/jetbrains-mono"
import "./index.css"
import App from "./App.tsx"
import { ThemeProvider } from "@/components/theme-provider.tsx"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>
)
