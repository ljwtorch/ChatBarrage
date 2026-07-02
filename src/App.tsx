import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '@/hooks/useTheme'
import Home from '@/pages/Home'
import Admin from '@/pages/Admin'

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}
