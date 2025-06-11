import './App.css';
import { Toaster } from 'react-hot-toast';
import Auth from './pages/Auth';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Appointment from './pages/Appointment';
import { GoogleOAuthProvider } from '@react-oauth/google';

import BarberList  from './pages/admindashboard/barbers/components/BarberList';

function App() {
  return (
    <GoogleOAuthProvider clientId="96009065849-q4gjenj6f91cr6suuhr3ujmvldlrvk0o.apps.googleusercontent.com">
      <Router>
        <Toaster position="top-right" reverseOrder={false} />
        <Routes>
          <Route path="/" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/appointment" element={<Appointment />} />

          
          <Route path="/admindashboard/barbers" element={<BarberList />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
