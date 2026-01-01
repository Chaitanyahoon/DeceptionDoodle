import { PeerProvider } from './network/PeerContext';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ParticleBackground from './components/ParticleBackground';
import LobbyScreen from './components/LobbyScreen';
import GameRoom from './components/GameRoom';

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
  console.log('App with LobbyScreen rendering...');
  return (
    <PeerProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<LobbyScreen />} />
            <Route path="/room/:id" element={<GameRoom />} />
          </Routes>
        </Layout>
      </Router>
    </PeerProvider>
  );
};

export default App;
