import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import {
    Container, Typography, Box, Tabs, Tab, Paper, Grid, CircularProgress, List, ListItem, ListItemText, ListItemIcon, IconButton, Divider, Alert
} from '@mui/material';
import {
    PhoneAndroid, BatteryChargingFull, SignalWifi4Bar, LocationOn, Sms, Phone, Folder, Refresh, BarChart
} from '@mui/icons-material';

import FileManager from './FileManager';
// Axios ke default export ki jagah naya 'api' instance import karen
import api from '../api/axios';

const socket = io('http://localhost:5000');

function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
        <div role="tabpanel" hidden={value !== index} {...other}>
            {value === index && (<Box sx={{ p: 3 }}>{children}</Box>)}
        </div>
    );
}

const DeviceDetails = () => {
    const { id: deviceId } = useParams();
    const navigate = useNavigate();

    const [device, setDevice] = useState(null);
    const [smsLogs, setSmsLogs] = useState([]);
    const [callLogs, setCallLogs] = useState([]);
    const [location, setLocation] = useState({ latitude: 'N/A', longitude: 'N/A' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [tabIndex, setTabIndex] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Placeholder data for now
                const deviceRes = { data: { deviceModel: 'Samsung S22', deviceId: deviceId, androidVersion: '12', battery: { level: 80, isCharging: false }, network: { name: 'Jazz', wifiStatus: 'Connected' }, location: { latitude: 24.8607, longitude: 67.0011 } } };
                const smsRes = { data: [{ _id: '1', type: 'inbox', address: '+923001234567', body: 'Hello, this is a test message.', date: new Date() }] };
                
                setDevice(deviceRes.data);
                setSmsLogs(smsRes.data);
                setLocation(deviceRes.data.location || { latitude: 'N/A', longitude: 'N/A' });
            } catch (err) {
                console.error("Failed to fetch data", err);
                setError('Failed to load device details.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        socket.emit('joinRoom', deviceId);
        socket.on('locationUpdated', (newLocation) => setLocation(newLocation));
        return () => socket.off('locationUpdated');
    }, [deviceId]);

    const handleTabChange = (event, newValue) => setTabIndex(newValue);

    if (loading) return <Container sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Container>;
    if (error) return <Container><Alert severity="error">{error}</Alert></Container>;
    if (!device) return <Typography variant="h5" align="center" sx={{ mt: 5 }}>Device not found.</Typography>;

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ p: 3, overflow: 'hidden' }}>
                <Typography variant="h4" gutterBottom>{device.deviceModel}</Typography>
                <Typography variant="subtitle1" color="text.secondary">Device ID: {device.deviceId}</Typography>
                <Divider sx={{ my: 2 }} />

                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={tabIndex} onChange={handleTabChange} variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile>
                        <Tab label="Info" icon={<PhoneAndroid />} iconPosition="start" />
                        <Tab label="Location" icon={<LocationOn />} iconPosition="start" />
                        <Tab label="SMS" icon={<Sms />} iconPosition="start" />
                        <Tab label="Call Logs" icon={<Phone />} iconPosition="start" />
                        <Tab label="File Manager" icon={<Folder />} iconPosition="start" />
                        <Tab label="App Usage" icon={<BarChart />} iconPosition="start" />
                    </Tabs>
                </Box>

                <TabPanel value={tabIndex} index={0}>
                    {/* ... Info Tab content ... */}
                </TabPanel>
                <TabPanel value={tabIndex} index={1}>
                    {/* ... Location Tab content ... */}
                </TabPanel>
                <TabPanel value={tabIndex} index={2}>
                    {/* ... SMS Tab content ... */}
                </TabPanel>
                <TabPanel value={tabIndex} index={3}>
                    <Typography>Call Log functionality to be implemented.</Typography>
                </TabPanel>
                <TabPanel value={tabIndex} index={4}>
                    <FileManager deviceId={deviceId} />
                </TabPanel>
                <TabPanel value={tabIndex} index={5}>
                    <Typography variant="h6">Application Usage Statistics</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        This data shows the total time an app was used in the foreground.
                    </Typography>
                    <List>
                        <ListItem><ListItemText primary="WhatsApp" secondary="2h 15m" /></ListItem>
                        <ListItem><ListItemText primary="YouTube" secondary="1h 45m" /></ListItem>
                        <ListItem><ListItemText primary="Chrome" secondary="1h 5m" /></ListItem>
                    </List>
                </TabPanel>
            </Paper>
        </Container>
    );
};

export default DeviceDetails;
