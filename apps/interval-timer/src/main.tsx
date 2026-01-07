import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import "@repo/tailwind-config";
import "@repo/ui/styles.css";
import { FirebaseAuthProvider } from './contexts/auth/FirebaseAuthProvider.js';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FirebaseAuthProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </FirebaseAuthProvider>
  </StrictMode>,
)
