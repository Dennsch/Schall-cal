import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './components/App';
import { initNativePlatform } from './services/platform';

// Initialize native features (keep-awake, status bar) when running on device
initNativePlatform();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
