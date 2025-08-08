import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { List, ListItem, ListItemText, Container, Typography } from '@mui/material';

const Dashboard = () => {
    const [devices, setDevices] = useState([]);

    useEffect(() => {
        const fetchDevices = async () => {
            const token = localStorage.getItem('token');
            const config = { headers: { 'x-auth-token': token } };
            // Note: Aapko device list get karne ke liye backend me route banana hoga
            // const res = await axios.get('http://localhost:5000/api/devices', config);
            // setDevices(res.data);
        };
        // fetchDevices();
    }, []);

    // Placeholder data
    const placeholderDevices = [
        { _id: '1', deviceId: 'unique-device-id-123', deviceModel: 'Samsung Galaxy S21' }
    ];

    return (
        <Container>
            <Typography variant="h4" gutterBottom>Registered Devices</Typography>
            <List>
                {placeholderDevices.map(device => (
                    <ListItem button component={Link} to={`/device/${device.deviceId}`} key={device._id}>
                        <ListItemText primary={device.deviceModel} secondary={`ID: ${device.deviceId}`} />
                    </ListItem>
                ))}
            </List>
        </Container>
    );
};

export default Dashboard;
