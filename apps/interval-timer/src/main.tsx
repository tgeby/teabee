import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import "@repo/tailwind-config";
import "@repo/ui/styles.css";
import { FirebaseAuthProvider } from './auth/FirebaseAuthProvider.jsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FirebaseAuthProvider>
      <App />
    </FirebaseAuthProvider>
  </StrictMode>,
)
