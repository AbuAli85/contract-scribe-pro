
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
    
    // Listen for window errors that might be related to printing
    window.addEventListener('error', handlePrintError)
    
    // Additional global print preparation
    const prepareGlobalPrinting = () => {
      // Add special class to html when window.print is called
      const originalPrint = window.print
      window.print = function() {
        document.documentElement.classList.add('is-printing')
        document.body.classList.add('printing')
        
        console.log("Print function called - adding printing classes")
        
        try {
          originalPrint()
        } finally {
          // Remove class after printing
          setTimeout(() => {
            document.documentElement.classList.remove('is-printing')
            document.body.classList.remove('printing')
            console.log("Print finished - removing printing classes")
          }, 1000)
        }
      }
    }
    
    prepareGlobalPrinting()
    
    return () => {
      window.removeEventListener('error', handlePrintError)
      // Restore original print function if it was modified
      if (window.print !== originalPrint) {
        window.print = originalPrint
      }
    }
  }, [])
  
  return (
    <ThemeProvider defaultTheme="light" storageKey="ui-theme">
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/create-contract" element={<CreateContract />} />
          <Route path="/print-error" element={<PrintErrorPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <Toaster />
    </ThemeProvider>
  )
}

export default App
