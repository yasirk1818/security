import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    List, ListItem, ListItemText, Container, Typography, Paper, TextField, Button, Box, CircularProgress, Alert
} from '@mui/material';

// Axios ke default export ki jagah naya 'api' instance import karen
import api from '../api/axios';

const Dashboard = () => {
    const [devices, setDevices] = useState([]);
    const [webviewUrl, setWebviewUrl] = useState('');
    const [newUrl, setNewUrl] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch current webview URL (is ke liye token ki zaroorat nahi)
                const urlRes = await api.get('/config/webview-url');
                setWebviewUrl(urlRes.data.url);
                setNewUrl(urlRes.data.url);

                // Fetch devices list (is ke liye token ki zaroorat hai, jo interceptor khud laga dega)
                // const devicesRes = await api.get('/devices');
                // setDevices(devicesRes.data);

            } catch (err) {
                console.error("Failed to fetch dashboard data", err);
                setError('Could not load data. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleUrlUpdate = async () => {
        if (!newUrl.startsWith('http')) {
            setError('Please enter a valid URL (e.g., https://example.com)');
            return;
        }
        setError('');
        setSuccess('');
        try {
            const res = await api.post('/config/webview-url', { url: newUrl });
            setWebviewUrl(res.data.url);
            setSuccess(res.data.msg); // Show success message
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to update URL.');
        }
    };

    if (loading) {
        return <Container sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Container>;
    }

    // Placeholder data jab tak backend me device route na banayen
    const placeholderDevices = [
        { _id: '1', deviceId: 'unique-device-id-123', deviceModel: 'Samsung Galaxy S21' }
    ];

    return (
        <Container>
            <Typography variant="h4" gutterBottom sx={{ mt: 4 }}>Admin Dashboard</Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            {/* WebView URL Management */}
            <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
                <Typography variant="h6">WebView URL Control</Typography>
                <Typography variant="body2" color="text.secondary">Current URL: {webviewUrl}</Typography>
                <Box display="flex" mt={2}>
                    <TextField
                        label="Enter New WebView URL"
                        variant="outlined"
                        fullWidth
                        value={newUrl}
                        onChange={(e) => setNewUrl(e.target.value)}
                        onFocus={() => { setError(''); setSuccess(''); }}
                    />
                    <Button variant="contained" onClick={handleUrlUpdate} sx={{ ml: 2, whiteSpace: 'nowrap' }}>
                        Update URL
                    </Button>
                </Box>
            </Paper>

            {/* Devices List */}
            <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h6">Registered Devices</Typography>
                <List>
                    {placeholderDevices.map(device => (
                        <ListItem button component={Link} to={`/device/${device.deviceId}`} key={device._id}>
                            <ListItemText primary={device.deviceModel} secondary={`ID: ${device.deviceId}`} />
                        </ListItem>
                    ))}
                </List>
            </Paper>
        </Container>
    );
};

export default Dashboard;
