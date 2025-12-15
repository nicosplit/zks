import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initWasm } from './services/WasmXor'

// Initialize WASM for fast XOR operations
initWasm().then(ready => {
  console.log('[App] WASM XOR:', ready ? 'Enabled (10x faster)' : 'Fallback to JS');
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

