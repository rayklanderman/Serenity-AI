import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Service Worker is DISABLED temporarily to fix blank page issues on mobile
// The nuclear cleanup in index.html will clear any stuck SWs
// TODO: Re-enable with a simpler, more reliable SW strategy
console.log('SerenityAI loaded - SW disabled for reliability');

