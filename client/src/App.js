import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { Box, CssBaseline } from '@mui/material';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import DeviceDetails from './components/DeviceDetails';
import Navbar from './components/Navbar'; // Navbar ko import karen

// Aek wrapper component jo location ke hisab se Navbar dikhaye ga
const AppContent = () => {
    const location = useLocation();
    const showNavbar = location.pathname !== '/login';

    return (
        <>
            {showNavbar && <Navbar />}
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/" element={<Dashboard />} />
                <Route path="/device/:id" element={<DeviceDetails />} />
            </Routes>
        </>
    );
};


function App() {
    return (
        <Router>
            <CssBaseline /> {/* MUI ke default styles ke liye */}
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <AppContent />
            </Box>
        </Router>
    );
}

export default App;
