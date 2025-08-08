import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { Box, CssBaseline } from '@mui/material';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import DeviceDetails from './components/DeviceDetails';
import Navbar from './components/Navbar';
import { NotificationProvider } from './context/NotificationContext'; // Provider import karen

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
        <NotificationProvider> {/* Provider ko yahan wrap karen */}
            <Router>
                <CssBaseline />
                <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                    <AppContent />
                </Box>
            </Router>
        </NotificationProvider>
    );
}

export default App;
