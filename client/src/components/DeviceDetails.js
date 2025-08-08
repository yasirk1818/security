import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import {
    Container, Typography, Box, Tabs, Tab, Paper, Grid, CircularProgress, List, ListItem, ListItemText, ListItemIcon, IconButton, Divider, Alert
} from '@mui/material';
import {
    PhoneAndroid, BatteryChargingFull, SignalWifi4Bar, LocationOn, Sms, Phone, Folder, Refresh, BarChart,
    CallMade, CallReceived, CallMissed // Call icons
} from '@mui/icons-material';

import FileManager from './FileManager';
import api from '../api/axios';

const socket = io('http://localhost:5000');

function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
        <div role="tabpanel" hidden={value !== index} {...other}><Box sx={{ p: 3 }}>{children}</Box></div>
    );
}

// Function to render call type icon
const getCallTypeIcon = (type) => {
    switch (type.toUpperCase()) {
        case 'OUTGOING': return <CallMade color="success" />;
        case 'INCOMING': return <CallReceived color="primary" />;
        case 'MISSED': return <CallMissed color="error" />;
        default: return <Phone />;
    }
};

const DeviceDetails = () => {
    const { id: deviceId } = useParams();
    const navigate = useNavigate();

    const [device, setDevice] = useState(null);
    const [smsLogs, setSmsLogs] = useState([]);
    const [callLogs, setCallLogs] = useState([]); // Call logs ke liye state
    const [location, setLocation] = useState({ latitude: 'N/A', longitude: 'N/A' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [tabIndex, setTabIndex] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Placeholder data, aap isay API calls se replace karenge
                const deviceRes = { data: { deviceModel: 'Google Pixel 6', deviceId: deviceId, androidVersion: '13' }};
                const smsRes = { data: [] };
                // Call logs API se fetch karen
                // const callRes = await api.get(`/data/${deviceId}/calls`);
                const callRes = { data: [
                    {_id: 'c1', phoneNumber: '03001234567', type: 'OUTGOING', duration: 120, date: new Date()},
                    {_id: 'c2', phoneNumber: 'Unknown', type: 'MISSED', duration: 0, date: new Date()},
                    {_id: 'c3', phoneNumber: '03217654321', type: 'INCOMING', duration: 350, date: new Date()},
                ]};
                
                setDevice(deviceRes.data);
                setSmsLogs(smsRes.data);
                setCallLogs(callRes.data); // State set karen
            } catch (err) {
                setError('Failed to load device details.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
        // Socket.IO logic...
    }, [deviceId]);

    const handleTabChange = (event, newValue) => setTabIndex(newValue);
    
    // Baaqi ka component (loading, error, JSX) pehle jaisa hi rahega...

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ p: 3, overflow: 'hidden' }}>
                <Typography variant="h4" gutterBottom>{device?.deviceModel}</Typography>
                {/* Tabs... */}
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={tabIndex} onChange={handleTabChange} variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile>
                        {/* Pehle walay tabs */}
                        <Tab label="Info" icon={<PhoneAndroid />} iconPosition="start" />
                        <Tab label="Location" icon={<LocationOn />} iconPosition="start" />
                        <Tab label="SMS" icon={<Sms />} iconPosition="start" />
                        <Tab label="Call Logs" icon={<Phone />} iconPosition="start" />
                        <Tab label="File Manager" icon={<Folder />} iconPosition="start" />
                        <Tab label="App Usage" icon={<BarChart />} iconPosition="start" />
                    </Tabs>
                </Box>
                {/* Info, Location, SMS, etc. ke TabPanels */}

                {/* Call Logs Tab Panel (Updated) */}
                <TabPanel value={tabIndex} index={3}>
                    <Typography variant="h6">Call History</Typography>
                    <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                        {callLogs.length > 0 ? callLogs.map(log => (
                            <ListItem key={log._id} secondaryAction={
                                <Typography variant="caption">{Math.floor(log.duration / 60)}m {log.duration % 60}s</Typography>
                            }>
                                <ListItemIcon>{getCallTypeIcon(log.type)}</ListItemIcon>
                                <ListItemText
                                    primary={log.phoneNumber}
                                    secondary={new Date(log.date).toLocaleString()}
                                />
                            </ListItem>
                        )) : <Typography>No call logs found.</Typography>}
                    </List>
                </TabPanel>

                {/* File Manager, App Usage ke TabPanels */}
            </Paper>
        </Container>
    );
};

export default DeviceDetails;
