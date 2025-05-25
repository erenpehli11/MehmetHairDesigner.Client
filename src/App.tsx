import './App.css'
import { Toaster } from 'react-hot-toast';
import Auth from './pages/Auth'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <Router>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/dashboard" element={<Dashboard />} />
        {/* ileriye dönük örnekler */}
        {/* <Route path="/dashboard" element={<Dashboard />} /> */}
        {/* <Route path="/admin" element={<AdminPanel />} /> */}
      </Routes>
    </Router>
  );
}

export default App
