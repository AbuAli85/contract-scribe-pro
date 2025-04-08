
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Dashboard from "./pages/Dashboard"
import CreateContract from "./pages/CreateContract"
import NotFound from "./pages/NotFound"
import { Toaster } from "./components/ui/toaster"
import { ThemeProvider } from "./components/ThemeProvider"
import PrintErrorPage from "./components/contract/PrintErrorPage"
import { useEffect, useRef } from "react"
import { attachDebuggerToWindow } from "./utils/printDebugger"

// Apply print styles globally
import "./styles/contract-global.css"

function App() {
  // We won't store a reference to the original print function 
  // to avoid cross-origin issues
  
  // Add global print error handler and debugger
  useEffect(() => {
    const handlePrintError = (error: ErrorEvent) => {
      console.error("Print system error:", error)
    }
    
    // Listen for window errors that might be related to printing
    window.addEventListener('error', handlePrintError)
    
    // Additional global print preparation
    const prepareGlobalPrinting = () => {
      try {
        // Only modify window.print if we're in the correct origin context
        if (typeof window !== 'undefined' && window === window.self) {
          // Add special class to html when window.print is called
          const originalPrint = window.print
          
          window.print = function() {
            document.documentElement.classList.add('is-printing')
            document.body.classList.add('printing')
            
            console.log("Print function called - adding printing classes")
            
            try {
              // Call the native window.print
              originalPrint.call(window)
            } catch (error) {
              console.error("Error during print operation:", error)
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
      } catch (error) {
        console.error("Failed to set up global print handler:", error)
      }
    }
    
    prepareGlobalPrinting()
    
    // Attach print debugger to window in development mode
    if (process.env.NODE_ENV === 'development') {
      attachDebuggerToWindow();
    }
    
    return () => {
      window.removeEventListener('error', handlePrintError)
      // We don't need to restore the original print function
      // as we're only modifying it on the main window
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
