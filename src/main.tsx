import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './app'
import { startClock } from './lib/time-of-day'
import './index.css'

// start before React renders so the first paint already has the right sky/theme
startClock()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
