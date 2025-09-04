import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import components
import FloatingDropdown from './components/FloatingDropdown';
import ErrorBoundary from './components/ErrorBoundary';

// Import pages
import Home from './pages/Home';
import Sponsors from './pages/Sponsors';
import Team from './pages/Team';
import Chambers from './pages/Chambers';
import Glimpse from './pages/Glimpse';
import Creators from './pages/Creators';
import Events from './pages/Events';

function App() {
  const [heroState, setHeroState] = useState({
    experienceStarted: false,
    showMainContent: false
  });

  return (
    <Router>
      <div className="App">
        <ErrorBoundary>
          <FloatingDropdown />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/sponsors" element={<Sponsors />} />
            <Route path="/team" element={<Team />} />
            <Route path="/chambers" element={<Chambers />} />
            <Route path="/glimpse" element={<Glimpse />} />
            <Route path="/creators" element={<Creators />} />
            <Route path="/events" element={<Events />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </ErrorBoundary>
      </div>
    </Router>
  );
}

export default App
