'use client'
import { useEffect, useState } from 'react';
import { findPost, findUser } from '@/app/api/route';
import { useParams, useRouter } from 'next/navigation';
import { Box, Button, Container, Divider, Grid, IconButton, Typography } from '@mui/material';
import { Map, Marker } from "react-map-gl";
import 'mapbox-gl/dist/mapbox-gl.css';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RoomIcon from '@mui/icons-material/Room';
import { styButton } from '@/components/Styles/styles';

export default function Posts() {
    const router = useRouter();
    const { id } = useParams();
    const [post, setPost] = useState({});
    const [user, setUser] = useState();
    const [location, setLocation] = useState({});
    const [viewport, setViewport] = useState({});

    const PostInfo = async () => {
        try {
            const result = await findPost(id);
            console.log(result);
            setPost(result);
            setLocation(result.location[0]);
            console.log(result.location)
            setViewport({
                ...viewport,
                latitude: result.location[0].lat,
                longitude: result.location[0].lng,
                zoom: 14
            });
        } catch (error) {
            console.log({ error: error })
        }
    }
    const UserInfo = async () => {
        try {
            if (post.user) {
                const result = await findUser(post.user._id);
                console.log(result);
                setUser(result);
            }
        } catch (error) {
            console.error(error);
        }
    }
    useEffect(() => {
        PostInfo();
    }, []);

    useEffect(() => {
        UserInfo();
    }, [post])

    return (
        <Box>
            <Container sx={{ my: 2 }} maxWidth="md">
                <Grid container spacing={4}>
                    <Grid item xs={12} md={6}>
                        <Button variant="contained" sx={styButton} onClick={() => router.push("/")}>
                            <ArrowBackIcon sx={{ color: "white" }} />
                        </Button>
                    </Grid>
                    <Grid item md={6} sx={{ display: "flex", justifyContent: "flex-end", gap: 3 }}>
                        <Button variant="contained" sx={styButton} onClick={() => router.push("/posts/new")}>
                            Nuevo Evento
                        </Button>
                    </Grid>
                </Grid>
            </Container>
            <Container sx={{ py: 4, backgroundColor: "#FFF", my: 2, borderRadius: 3 }} maxWidth="md">
                <Grid container spacing={2}>
                    <Grid item md={6} sx={{ overflow: "auto", scrollbarColor: "#C9C8C4 transparent", scrollbarWidth: "thin" }}>
                        <Grid item sx={{ display: 'flex', flexDirection: 'column', mt: 3 }}>
                            <Typography variant='h5'>
                                Nombre del evento:
                            </Typography>
                            <Typography variant='h4' sx={{ color: 'lightcoral', mb: 2 }}>
                                {post.title}
                            </Typography>
                        </Grid>
                        <Divider />
                        <Grid item sx={{ my: 2 }}>
                            <Typography variant='h5'>Descripcion del evento:</Typography>
                            <Typography variant='subtitle1'>{post.description}</Typography>
                        </Grid>
                        <Divider />
                        <Grid item sx={{ my: 2 }}>
                            <Typography variant='h5'>Fecha:</Typography>
                            <Typography variant='subtitle1' sx={{ color: "gray" }}>{post.date}</Typography>
                        </Grid>
                    </Grid>
                    <Grid item xs={6} sx={{ height: "350px" }}>
                        <Typography variant='h5' sx={{ my: 2 }}>Lugar del evento</Typography>
                        <Box sx={{ height: "80%", borderRadius: 3, overflow: "hidden" }}>
                            <Map
                                {...viewport}
                                onMove={evt => setViewport(evt.viewport)}
                                mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_API_KEY}
                                attributionControl={false}
                                mapStyle='mapbox://styles/mapbox/dark-v11'
                            >
                                {location.lat && location.lng ?
                                    <Marker
                                        latitude={location.lat}
                                        longitude={location.lng}
                                    >
                                        <RoomIcon fontSize='large' sx={{color:'lightcoral'}} />
                                    </Marker> : null
                                }
                            </Map>
                        </Box>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );

}