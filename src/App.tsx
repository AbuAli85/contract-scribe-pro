
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Dashboard from "./pages/Dashboard"
import CreateContract from "./pages/CreateContract"
import NotFound from "./pages/NotFound"
import { Toaster } from "./components/ui/toaster"
import { ThemeProvider } from "./components/ThemeProvider"
import PrintErrorPage from "./components/contract/PrintErrorPage"

function App() {
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
