import React from 'react';
import { createRoot } from 'react-dom/client';
import AppShell from './ui/AppShell.jsx';
import './theme.css';

// PUBLIC_INTERFACE
function bootstrap() {
  /** Bootstrap the React application into the #app container. */
  const container = document.getElementById('app');
  if (!container) {
    throw new Error('App container #app not found');
  }
  const root = createRoot(container);
  root.render(<AppShell />);
}

bootstrap();
