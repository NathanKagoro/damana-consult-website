import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './styles/global.css'
import App from './App.jsx'

const root = document.getElementById('root')
const app = (
  <StrictMode>
    <App />
  </StrictMode>
)

// The production build ships the page already rendered (scripts/prerender.mjs),
// so React only has to attach the menu behaviour. The dev server starts empty.
if (root.firstElementChild) hydrateRoot(root, app)
else createRoot(root).render(app)
