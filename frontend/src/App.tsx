import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './lib/theme-provider';
import Welcome from './pages/auth/Welcome';
import Login from './pages/auth/Login';
import SignUp from './pages/auth/SignUp';
import ForgotPassword from './pages/auth/ForgotPassword';
import OTPVerification from './pages/auth/OTPVerification';
import MainApp from './pages/MainApp';
import './App.css';

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="voicify-theme">
      <Router>
        <div className="App">
          <Routes>
            {/* Authentication Routes */}
            <Route path="/" element={<Welcome />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/otp-verification" element={<OTPVerification />} />

            {/* Main App Route */}
            <Route path="/app/*" element={<MainApp />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
