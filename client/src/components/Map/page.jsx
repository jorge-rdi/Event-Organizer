"use client";
import "mapbox-gl/dist/mapbox-gl.css";
import { styButton } from "../Styles/styles";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Grid,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import { findUser } from "../../app/api/route";
import { useEffect, useRef, useState } from "react";
import { useAppSelector } from "@/lib/hooks";
import { selectUser } from "@/lib/features/users/userSlice";
import SearchIcon from "@mui/icons-material/Search";
import EmojiFlagsTwoToneIcon from "@mui/icons-material/EmojiFlagsTwoTone";
import * as geolib from "geolib";
import styles from "./page.module.css";
import mapboxgl from "!mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax
import axios from "axios";
import ReactDOM from "react-dom";
import Link from "next/link";
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_API_KEY;
const Map = () => {
  const router = useRouter();
  const [userPost, setUserPost] = useState();
  const currentUser = useAppSelector(selectUser);
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [todayEvents, setTodayEvents] = useState([]);
  const mapContainer = useRef(null);
  const map = useRef(null); // useRef previene que el mapa se recargue cada vez que el usuario interactue
  const [lng, setLng] = useState(-55.86);
  const [lat, setLat] = useState(-27.34);
  const [zoom, setZoom] = useState(13);
  const currentDate = new Date(); // Obtener la fecha actual
  useEffect(() => {
    PostsInfo();
    UserPost();
  }, []);

  useEffect(() => {
    filterPosts();
  }, [search]);

  useEffect(() => {
    filterTodayEvents();
  }, [posts]);

  const PostsInfo = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/post/all`, {
        withCredentials: true,
      });
      const result = await response.data;
      console.log(result);
      setPosts(result);
      setFilteredPosts(result);
    } catch (error) {
      console.log({ error: error });
    }
  };

  const filterPosts = () => {
    const filtered = posts.filter(
      (post) =>
        post.title.toLowerCase().includes(search.toLowerCase()) ||
        post.description.toLowerCase().includes(search.toLowerCase()),
    );
    setFilteredPosts(filtered);
  };

  const UserPost = async () => {
    try {
      const result = await findUser(currentUser._id);
      setUserPost(result);
    } catch (error) {
      console.log({ error: error });
    }
  };

  const filterTodayEvents = () => {
    const today = new Date().toISOString().split("T")[0]; // Obtener la fecha actual en formato 'YYYY-MM-DD'
    const todayEvents = posts.filter((post) => post.date === today);
    setTodayEvents(todayEvents);
  };

  const sty = {
    color: "#FFFF",
    "& label.Mui-focused": {
      color: "black",
      borderColor: "black",
    },
    "& .MuiOutlinedInput-root": {
      "&.Mui-focused fieldset": {
        color: "black",
        borderColor: "black",
      },
    },
    "& .MuiOutlinedInput-notchedOutline": {
      border: "none",
    },
    width: { xs: "90vw", sm: "94vw", md: "31vw", lg: "290px" },
    bgcolor: "#E0E2E7",
    borderRadius: "25px",
  };

  useEffect(() => {
    // Inicia el mapa solo una vez
    if (map.current) return;

    // Asigna los valores al mapa
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [lng, lat],
      zoom: zoom,
      attributionControl: false,
    });

    // Guarda la nueva latitud, longitud y zoom cuando el usuario interactua con el mapa
    map.current.on("move", () => {
      setLng(map.current.getCenter().lng.toFixed(4));
      setLat(map.current.getCenter().lat.toFixed(4));
      setZoom(map.current.getZoom().toFixed(2));
    });
    map.current.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: true,
      }),
    );
    navigator.geolocation.getCurrentPosition((position) => {
      // Crea un nuevo elemento DOM
      const el = document.createElement("div");

      // Usa el elemento DOM como marcador
      new mapboxgl.Marker(el)
        .setLngLat([position.coords.longitude, position.coords.latitude])
        .addTo(map.current);
    });

    // La funcion 'load' espera a que el mapa esté cargado antes de llamar a getLocation
    map.current.on("load", PostsInfo);
  }, [lng, lat]);

  useEffect(() => {
    if (posts && map.current) {
      posts.map((item) => {
        // Crear un nuevo elemento div para el marcador
        const markerElement = document.createElement("div");
        markerElement.className = styles.marker; // Aplica las clases de estilo según tu archivo de estilos

        // Crea el icono AssistantPhotoIcon
        const icon = (
          <EmojiFlagsTwoToneIcon style={{ fontSize: 35, color: "tomato" }} />
        );

        // Renderiza el icono AssistantPhotoIcon en el elemento div
        ReactDOM.render(icon, markerElement);

        const popup = new mapboxgl.Popup({
          closeButton: false,
          className: styles["custom-popup"],
        }).setHTML(`
                        <div>
                            <div style="background-color: #f3f4f6; padding: 7px; border-radius: 20px">
                                <strong>Nombre:</strong>
                                <span>${item.title}</span>
                                <div>
                                    <p>
                                        <strong >Descripcion:</strong>
                                        <span>${item.description}</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    `);

        new mapboxgl.Marker(markerElement)
          .setLngLat([item.location[0].lng, item.location[0].lat])
          .setPopup(popup)
          .addTo(map.current);
      });

      navigator.geolocation.getCurrentPosition((position) => {
        const userLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        const markersWithinRadius = posts?.filter((item) => {
          const markerLocation = {
            latitude: item.location[0].lat,
            longitude: item.location[0].lng,
          };
          const distance = geolib.getDistance(markerLocation, userLocation);
          const distanceInKm = distance / 1000;
          return distanceInKm <= 20;
        });

        const distancesWithinRadius = markersWithinRadius.map((item) => {
          const markerLocation = {
            latitude: item.location[0].lat,
            longitude: item.location[0].lng,
          };
          const distance = geolib.getDistance(markerLocation, userLocation);
          return distance / 1000;
        });
      });
    }
  }, [posts]);
  return (
    <Container
      maxWidth="lg"
      sx={{ height: "100", justifyContent: "center", mt: "2%" }}
    >
      <Grid container>
        <Grid
          item
          sx={{
            display: "flex",
            width: "100%",
            justifyContent: "space-between",
            gap: 3,
            mb: 2,
            px: 1,
          }}
        >
          <Grid item sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Typography sx={{ fontSize: "20px" }}>
              Bienvenido {currentUser.firstName} {currentUser.lastName} !
            </Typography>
          </Grid>
          <Grid item sx={{ display: "flex", gap: "10px" }}>
            <Grid item>
              <TextField
                placeholder="Buscar"
                variant="outlined"
                size="small"
                sx={sty}
                InputProps={{
                  startAdornment: (
                    <IconButton>
                      <SearchIcon />
                    </IconButton>
                  ),
                }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </Grid>
            <Button
              variant="contained"
              sx={styButton}
              onClick={() => router.push("/")}
            >
              Home
            </Button>
            <Button
              variant="contained"
              sx={styButton}
              onClick={() => router.push("/posts/new")}
            >
              Nuevo Evento
            </Button>
          </Grid>
        </Grid>
      </Grid>
      <Grid container sx={{ height: "80vh" }}>
        <Grid
          container
          spacing={2}
          sx={{
            display: "flex",
            flexDirection: "column",
            bgcolor: "white",
            my: 1,
            borderRadius: "15px",
          }}
        >
          <Typography
            sx={{ fontSize: "20px", ml: 3, mt: 2, mb: 1, color: "tomato" }}
          >
            Eventos de hoy
          </Typography>
          <Divider variant="middle" />
          {todayEvents.length > 0 ? (
            todayEvents.map((event) => (
              <Grid item key={event.id} sx={{ p: 1 }}>
                <Card sx={{ bgcolor: "transparent", boxShadow: "none" }}>
                  <CardContent spacing={3} sx={{ display: "flex" }}>
                    <Grid item md={4}>
                      <Typography variant="h6" component="h2">
                        {event.title}
                      </Typography>
                    </Grid>
                    <Grid item md={4}>
                      <Typography variant="h6" component="h2">
                        {event.date}
                      </Typography>
                    </Grid>
                    <Grid item md={4}>
                      <Link
                        md={4}
                        href={`/posts/${event._id}`}
                        style={{ textDecoration: "none", color: "#3B3561" }}
                      >
                        Ver más
                      </Link>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item sx={{ ml: 2 }}>
              <Typography
                variant="subtitle2"
                component="h2"
                sx={{ color: "gray" }}
              >
                No hay eventos para hoy.
              </Typography>
            </Grid>
          )}
        </Grid>
        <Grid container>
          <Grid
            container
            spacing={2}
            sx={{
              display: "flex",
              bgcolor: "white",
              my: 1,
              borderRadius: "20px",
            }}
          >
            <Grid item md={6}>
              <Typography
                sx={{ fontSize: "20px", ml: 3, mt: 2, mb: 1, color: "#25D366" }}
              >
                Eventos
              </Typography>
              <Divider variant="middle" />
              {filteredPosts

                .sort((a, b) => new Date(b.date) - new Date(a.date)) //
                .map((post) => (
                  <Grid item key={post.id}>
                    <Card sx={{ bgcolor: "transparent", boxShadow: "none" }}>
                      <CardContent
                        spacing={3}
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Grid item md={4}>
                          <Typography sx={{ fontSize: "20px" }} component="h2">
                            {post.title}
                          </Typography>
                          <Typography
                            variant="subtitle2"
                            component="h2"
                            sx={{ color: "gray" }}
                          >
                            {post.date}
                          </Typography>
                          {post.date &&
                          post.date < new Date().toISOString().split("T")[0] ? (
                            <Typography
                              variant="subtitle2"
                              component="h2"
                              sx={{ color: "tomato" }}
                            >
                              Pasado
                            </Typography>
                          ) : post.date &&
                            post.date >
                              new Date().toISOString().split("T")[0] ? (
                            <Typography
                              variant="subtitle2"
                              component="h2"
                              sx={{ color: "lightgreen" }}
                            >
                              Proximente
                            </Typography>
                          ) : (
                            <Typography
                              variant="subtitle2"
                              component="h2"
                              sx={{ color: "orange" }}
                            >
                              Es hoy
                            </Typography>
                          )}
                        </Grid>
                        <Link
                          md={4}
                          href={`/posts/${post._id}`}
                          style={{ textDecoration: "none", color: "#3B3561" }}
                        >
                          Ver más
                        </Link>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
            </Grid>
            <Grid item md={6}>
              <Typography
                sx={{ fontSize: "20px", ml: 3, mt: 2, mb: 1, color: "#34B7F1" }}
              >
                Visualiza tus Eventos
              </Typography>
              <Divider variant="middle" />
              <Grid
                item
                ref={mapContainer}
                sx={{
                  height: "380px",
                  mr: 2,
                  my: 2,
                  borderRadius: {
                    lg: "20px 20px 20px 20px",
                    md: "20px 20px 20px 20px",
                    sm: "20px 20px 20px 20px",
                    xs: "20px 20px 20px 20px",
                  },
                }}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Map;
