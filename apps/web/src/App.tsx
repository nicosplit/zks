import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LandingPage } from './components/limeshare/LandingPage';
import { Terms } from './components/pages/Terms';
import { Privacy } from './components/pages/Privacy';
import { Security } from './components/pages/Security';
import { Blog } from './components/pages/Blog';
import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/security" element={<Security />} />
        <Route path="/blog" element={<Blog />} />
      </Routes>
    </Router>
  );
}

export default App;
