import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Dashboard from "./pages/Dashboard"
import CreateContract from "./pages/CreateContract"
import ContractDetail from "./pages/ContractDetail"
import NotFound from "./pages/NotFound"
import { Toaster } from "./components/ui/toaster"
import { ThemeProvider } from "./components/ThemeProvider"
import PrintErrorPage from "./components/contract/PrintErrorPage"
import { useEffect } from "react"
import { attachDebuggerToWindow } from "./utils/printDebugger"
import HomePage from "./pages/Index"
import SettingsPage from "./pages/Settings"
import Templates from "./pages/Templates"
import MyTemplates from "./pages/MyTemplates"
import TemplateDownload from "./pages/TemplateDownload"
import FillTemplate from "./pages/FillTemplate"
import Auth from "./pages/Auth"
import AutoAuth from "./pages/AutoAuth"
import Upgrade from "./pages/Upgrade"
import Blog from "./pages/Blog"
import BlogPost from "./pages/BlogPost"
import AppLayout from "./components/AppLayout"
import MinistryLetters from "./pages/MinistryLetters"
import Parties from "./pages/Parties"
import PartyDetail from "./pages/PartyDetail"
import Records from "./pages/Records"
import NewContract from "./pages/NewContract"
import RecordDetail from "./pages/RecordDetail"

// Apply print styles globally
import "./styles/contract-global.css"

function App() {
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
        // Critical: Only modify if we're in the main window (not iframe)
        // This prevents cross-origin issues
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
    }
  }, [])
  
  return (
    <ThemeProvider defaultTheme="light" storageKey="ui-theme">
      <Router>
        <Routes>
          {/* Public / standalone pages */}
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/auto-auth" element={<AutoAuth />} />
          <Route path="/upgrade" element={<Upgrade />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/print-error" element={<PrintErrorPage />} />

          {/* App shell — sidebar layout */}
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/create-contract" element={<CreateContract />} />
            <Route path="/contracts/:contractId" element={<ContractDetail />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/templates" element={<Templates />} />
            <Route path="/templates/fill/:templateId" element={<FillTemplate />} />
            <Route path="/templates/download/:templateId" element={<TemplateDownload />} />
            <Route path="/my-templates" element={<MyTemplates />} />
            <Route path="/letters" element={<MinistryLetters />} />
            {/* CLM system */}
            <Route path="/parties" element={<Parties />} />
            <Route path="/parties/:id" element={<PartyDetail />} />
            <Route path="/records" element={<Records />} />
            <Route path="/records/new" element={<NewContract />} />
            <Route path="/records/:id" element={<RecordDetail />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <Toaster />
    </ThemeProvider>
  )
}

export default App
