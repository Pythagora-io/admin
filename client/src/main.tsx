
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// Import design system styles
import '../design/dist/main.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

