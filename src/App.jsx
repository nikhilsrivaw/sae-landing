import React from 'react';

// Import components
import Hero from './sections/Hero';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <div className="App">
      <ErrorBoundary>
        <Hero />
      </ErrorBoundary>
    </div>
  );
}

export default App
