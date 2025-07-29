import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import WelcomePage from './components/WelcomePage/WelcomePage';
import ResourcesPage from './components/ResourcesPage/ResourcesPage';
import AdminPanel from './components/admin/AdminPanel';
import Article from './components/Article/Article';
import TestAuth from './components/TestAuth/TestAuth';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Routes>
            <Route path="/" element={<WelcomePage />} />
            <Route path="/recursos" element={<ResourcesPage />} />
            <Route path="/recursos" element={<ResourcesPage />} />
            <Route path="/recursos/:id" element={<Article />} /> 
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/test-auth" element={<TestAuth />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
