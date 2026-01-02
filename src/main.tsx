import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

try {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
} catch (e) {
  console.error("CRITICAL RENDER ERROR:", e);
  document.body.innerHTML = `<h1 style="color:red">CRITICAL RENDER ERROR: ${e}</h1>`;
}

