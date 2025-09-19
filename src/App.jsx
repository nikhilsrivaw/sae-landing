import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import components
import FloatingDropdown from './components/FloatingDropdown';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider } from './contexts/AuthContext';

// Lazy load pages for better performance and error isolation
const Home = React.lazy(() => import('./pages/Home'));
const Sponsors = React.lazy(() => import('./pages/Sponsors'));
const SponsorsTest = React.lazy(() => import('./pages/SponsorsTest'));
const Team = React.lazy(() => import('./pages/Team'));
const Chambers = React.lazy(() => import('./pages/Chambers'));
// const Glimpse = React.lazy(() => import('./pages/Glimpse'));
const Creators = React.lazy(() => import('./pages/Creators'));
const Events = React.lazy(() => import('./pages/Events'));
const AdminNew = React.lazy(() => import('./pages/AdminNew'));

// Loading component
const Loading = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-white text-lg font-bold">Loading...</p>
    </div>
  </div>
);

function App() {
  // const [heroState, setHeroState] = useState({
  //   experienceStarted: false,
  //   showMainContent: false
  // });

  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <ErrorBoundary>
            <FloatingDropdown />
            <Suspense fallback={<Loading />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/sponsors" element={<Sponsors />} />
                <Route path="/sponsors-test" element={<SponsorsTest />} />
                <Route path="/team" element={<Team />} />
                <Route path="/chambers" element={<Chambers />} />
                {/* <Route path="/glimpse" element={<Glimpse />} /> */}
                <Route path="/creators" element={<Creators />} />
                <Route path="/events" element={<Events />} />
                <Route path="/admin" element={<AdminNew />} />
                <Route path="*" element={<Home />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App
