import { lazy, Suspense } from 'react';
import { PeerProvider } from './network/PeerContext';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ParticleBackground from './components/ParticleBackground';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastProvider } from './components/ToastContext';

// Lazy load components for better performance
const LobbyScreen = lazy(() => import('./components/LobbyScreen'));
const GameRoom = lazy(() => import('./components/GameRoom'));

// Loading component for lazy-loaded routes
const LoadingScreen = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
      <p className="text-white/70">Loading...</p>
    </div>
  </div>
);

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen w-full bg-background text-white selection:bg-primary selection:text-white overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-background to-background pointer-events-none" />
      <ParticleBackground />
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  console.log('App IS rendering (Simplified)...');
  return (
    <ErrorBoundary>
      <ToastProvider>
        <PeerProvider>
          <Router>
            <Layout>
              <Suspense fallback={<LoadingScreen />}>
                <Routes>
                  <Route path="/" element={<LobbyScreen />} />
                  <Route path="/room/:id" element={<GameRoom />} />
                </Routes>
              </Suspense>
            </Layout>
          </Router>
        </PeerProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
};

export default App;
