
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Dashboard from "./pages/Dashboard"
import CreateContract from "./pages/CreateContract"
import NotFound from "./pages/NotFound"
import { Toaster } from "./components/ui/toaster"
import { ThemeProvider } from "./components/ThemeProvider"
import PrintErrorPage from "./components/contract/PrintErrorPage"
import { useEffect } from "react"

// Apply print styles globally
import "./styles/contract-global.css"

function App() {
  // Add global print error handler
  useEffect(() => {
    const handlePrintError = (error: ErrorEvent) => {
      console.error("Print system error:", error)
    }
    
    window.addEventListener('error', handlePrintError)
    return () => window.removeEventListener('error', handlePrintError)
  }, [])
  
  return (
    <ThemeProvider defaultTheme="light" storageKey="ui-theme">
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/create-contract" element={<CreateContract />} />
          <Route path="/print-error" element={<PrintErrorPage redirectUrl="/create-contract" />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <Toaster />
    </ThemeProvider>
  )
}

export default App
