import { useEffect } from 'react'
import AppRouter from './router'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import { logEvent } from './services/logger'
import './App.css'

const App = () => {
  useEffect(() => {
    logEvent('info', 'app', 'initialized')
  }, [])

  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
