import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    IconButton,
    CircularProgress,
    Typography,
    Breadcrumbs,
    Link,
    Box,
    Paper
} from '@mui/material';
import {
    Folder,
    Description,
    Download,
    ArrowBack
} from '@mui/icons-material';

const FileManager = ({ deviceId }) => {
    const [items, setItems] = useState([]);
    const [currentPath, setCurrentPath] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchItems = async (path) => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: { 'x-auth-token': token },
                params: { path: path } // path ko query parameter me bhejna
            };
            const res = await axios.get(`http://localhost:5000/api/files/list/${deviceId}`, config);
            // Folders ko pehle sort karna
            const sortedItems = res.data.sort((a, b) => b.isDirectory - a.isDirectory);
            setItems(sortedItems);
        } catch (err) {
            setError('Could not load files. The directory might be empty or inaccessible.');
            setItems([]);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems(currentPath);
    }, [currentPath, deviceId]);

    const handleItemClick = (item) => {
        if (item.isDirectory) {
            setCurrentPath(item.path);
        }
    };

    const handleGoBack = () => {
        const pathParts = currentPath.split('/').filter(p => p);
        pathParts.pop();
        setCurrentPath(pathParts.join('/'));
    };

    // Breadcrumbs ke liye path ko parts me torna
    const pathSegments = currentPath.split('/').filter(p => p);

    return (
        <Paper elevation={2} sx={{ p: 2 }}>
            <Box display="flex" alignItems="center" mb={2}>
                {currentPath && (
                    <IconButton onClick={handleGoBack}>
                        <ArrowBack />
                    </IconButton>
                )}
                <Breadcrumbs>
                    <Link underline="hover" color="inherit" href="#" onClick={() => setCurrentPath('')}>
                        Root
                    </Link>
                    {pathSegments.map((segment, index) => {
                        const path = pathSegments.slice(0, index + 1).join('/');
                        return (
                            <Link key={index} underline="hover" color="inherit" href="#" onClick={() => setCurrentPath(path)}>
                                {segment}
                            </Link>
                        );
                    })}
                </Breadcrumbs>
            </Box>

            {loading ? (
                <Box display="flex" justifyContent="center"><CircularProgress /></Box>
            ) : error ? (
                <Typography color="error">{error}</Typography>
            ) : (
                <List>
                    {items.map((item, index) => (
                        <ListItem key={index}
                            secondaryAction={
                                !item.isDirectory && (
                                    <IconButton
                                        edge="end"
                                        href={`http://localhost:5000${item.thumbnail}`}
                                        download={item.name}
                                        target="_blank"
                                    >
                                        <Download />
                                    </IconButton>
                                )
                            }
                            button={item.isDirectory}
                            onClick={() => handleItemClick(item)}
                        >
                            <ListItemIcon>
                                {item.isDirectory ? <Folder /> : (
                                    // Thumbnail for images
                                    item.name.match(/\.(jpeg|jpg|gif|png)$/) ?
                                    <img src={`http://localhost:5000${item.thumbnail}`} alt="thumbnail" width="40" height="40" style={{ objectFit: 'cover' }} />
                                    : <Description />
                                )}
                            </ListItemIcon>
                            <ListItemText primary={item.name} secondary={`${(item.size / 1024).toFixed(2)} KB`} />
                        </ListItem>
                    ))}
                </List>
            )}
        </Paper>
    );
};

export default FileManager;
