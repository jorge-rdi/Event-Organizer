'use client'
import { Box, Button, Container, Grid, MenuItem, TextField } from "@mui/material";
import { useRouter } from "next/navigation";
import { Fragment, useEffect, useState } from "react";
// mapBox imports
import 'mapbox-gl/dist/mapbox-gl.css';
import { Map, Marker, GeolocateControl } from "react-map-gl";
import { useAppSelector } from "@/lib/hooks";
import { selectUser } from "@/lib/features/users/userSlice";
import { styButton } from "../Styles/styles";
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RoomIcon from '@mui/icons-material/Room';
import Swal from "sweetalert2";
import dayjs from 'dayjs';
const textFieldSty = {
    '& label.Mui-focused': {
        color: '#3B3561'
    },
    '& .MuiOutlinedInput-root': {
        '&.Mui-focused fieldset': {
            borderColor: '#3B3561'
        }
    }
}
const PostForm = ({ onSubmit, preset = {} }) => {
    const router = useRouter();
    const currentUser = useAppSelector(selectUser);
    const [error, setError] = useState({});
    const [title, setTitle] = useState("");
    const [date, setDate] = useState("");
    const [description, setDescription] = useState("");
    const [location, setLocation] = useState([]);
    const [viewport, setViewport] = useState({}); // se van a guardar la ubicacion actual latitud y longitud
    

    const createdOk = () => { router.push("/") };
    const createdFail = (errorMsg) => {
        if (errorMsg.response?.data?.error?.errors?.message) {
            const validationErrors = errorMsg.response.data.error.errors.message;
            console.log(validationErrors);
            setError({
                title: validationErrors.title,
                date: validationErrors.date,
                description: validationErrors.description,
                location: validationErrors.location
            });
            onFail(error);
            console.log(error);
        } else if (errorMsg.response?.data?.error.errors) {
            const validationErrors = errorMsg.response.data.error.errors;
            console.log(validationErrors);
            setError({
                title: validationErrors.title,
                date: validationErrors.date,
                description: validationErrors.description,
                location: validationErrors.location
            })
        } else {
            createdOk();
        }
    }
    const handleFormSubmit = (e) => {
        e.preventDefault();
        
        // Verificar si todos los campos están llenos
        if (title && date && description && location.lat && location.lng) {
            const data = {
                title: title,
                date: date ? dayjs(date).format('YYYY-MM-DD') : "",
                description: description,
                location: location.length === 0 ? null : location,
                user: currentUser._id
            };
            
            onSubmit(data, createdOk, createdFail);
        } else {
            Swal.fire({
                toast: true,
                icon: "error",
                iconColor: "white",
                position: "bottom",
                color: "white",
                title: "Rellene todos los campos correctamente.",
                background: "tomato",
                showConfirmButton: false,
                timer: 2000,
                timerProgressBar: true,
            });
        }
    };
    


    useEffect(() => {
        if (
            preset.title &&
            preset.date &&
            preset.description &&
            preset.location
        ) {
            setTitle(preset.title);
            setDate(preset.date);
            setDescription(preset.description);
            setLocation(preset.location[0]);
        }
    }, [preset]);

    //--------------------------MAPBOX-------------------------------->
    //Mediante el evento, quita longitud y latitud donde se clickeo
    const handleLocation = (e) => {
        setLocation({
            lng: e.lngLat.lng,
            lat: e.lngLat.lat
        });
    }

    useEffect(() => {
        /*Se usa la API de geolocalización del navegador para obtener nuestra ubicación actual durante el tiempo de carga y configurando
        el resultado como nuestra ventana gráfica predeterminada*/
        navigator.geolocation.getCurrentPosition((pos) => {
            //se setea la ubicacion actual del usuario 
            setViewport({
                ...viewport, //ubicacion anterior
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
                zoom: 14,
            });
        });
    }, []);


    return (
        <Fragment>
            <Container sx={{ my: 2 }} maxWidth="md">
                <Grid container spacing={4}>
                    <Grid item xs={12} md={6}>
                        <Button variant="contained" sx={styButton} onClick={() => router.push("/")}>
                            <ArrowBackIcon sx={{ color: "white" }} />
                        </Button>
                    </Grid>
                </Grid>
            </Container>
            <Container component="main" maxWidth="md" sx={{ backgroundColor: "#FFF", borderRadius: 3 }}>
                <Box sx={{ padding: 5 }}>
                    <Fragment>
                        <Box component="form" noValidate onSubmit={handleFormSubmit}>
                            <Grid container sx={{ display: 'flex', gap: '35px' }}>
                                <Grid item md={6} sx={{ mt: 1 }}>
                                    <TextField
                                        required
                                        name="title"
                                        label="Título"
                                        sx={textFieldSty}
                                        fullWidth
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        error={error?.title ? true : false}
                                        helperText={error?.title?.message}
                                    />
                                </Grid>
                                <Grid item sx={{ display: "flex" }} >
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DemoContainer components={['DatePicker']}>
                                            <DatePicker
                                                sx={{ width: '350px' }}
                                                label="Fecha del evento"
                                                required
                                                name="date"
                                                fullWidth
                                                onChange={(value) => setDate(value)}
                                                error={error?.date ? true : false}
                                                helperText={error?.date?.message}
                                            />
                                        </DemoContainer>
                                    </LocalizationProvider>
                                </Grid>
                            </Grid>
                            <Grid item sx={{ width: '100%', my: 3 }} >
                                <TextField
                                    required
                                    name="description"
                                    label="Descripción"
                                    sx={textFieldSty}
                                    fullWidth
                                    multiline
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    error={error?.description ? true : false}
                                    helperText={error?.description?.message}
                                    rows={4}
                                />
                            </Grid>
                            {
                                viewport.latitude && viewport.longitude && (
                                    <Grid item sx={{ height: "40vh", borderRadius: 3, overflow: "hidden", width: '100%' }} >
                                        <Map
                                            mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_API_KEY}
                                            attributionControl={false}
                                            initialViewState={viewport} //inserta como valores iniciales lo asignado a viewport
                                            onClick={handleLocation}
                                            mapStyle='mapbox://styles/mapbox/streets-v12'
                                        >
                                            <GeolocateControl
                                                positionOptions={{ enableHighAccuracy: true }}
                                                trackUserLocation={true}
                                            />
                                            {
                                                location.lat && location.lng ?
                                                    <Marker
                                                        latitude={location.lat}
                                                        longitude={location.lng}
                                                    >
                                                        <RoomIcon />
                                                    </Marker> : null
                                            }
                                        </Map>
                                    </Grid>
                                )
                            }
                            <Box sx={{ pt: 2 }}>
                                <Box sx={{ flex: '1 1 auto' }} />
                                <Grid container justifyContent="flex-end">
                                    <Grid item>
                                        <Grid item xs={12}>
                                            <Button
                                                type="submit"
                                                fullWidth
                                                sx={styButton}
                                            >
                                                Publicar
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Box>
                        </Box>
                    </Fragment>
                </Box>
            </Container>
        </Fragment >
    )
}

export default PostForm;
