import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Global error handlers for debugging
window.addEventListener('error', (event) => {
  console.group('🚨 Global JavaScript Error');
  console.error('Error:', event.error);
  console.error('Message:', event.message);
  console.error('Filename:', event.filename);
  console.error('Line:', event.lineno);
  console.error('Column:', event.colno);
  console.groupEnd();
});

window.addEventListener('unhandledrejection', (event) => {
  console.group('🚨 Unhandled Promise Rejection');
  console.error('Promise rejection:', event.reason);
  console.error('Promise:', event.promise);
  console.groupEnd();
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
