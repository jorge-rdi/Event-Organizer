'use client'
import NavBar from "@/components/NavBar/page";
import { Avatar, CardMedia, Container, Dialog, DialogActions, DialogTitle, Divider, Grid, IconButton, TextField, Typography } from "@mui/material";
import { Fragment, useEffect, useState } from "react";
import AttachEmailOutlinedIcon from '@mui/icons-material/AttachEmailOutlined';
import { selectUser } from "@/lib/features/users/userSlice";
import { useAppSelector } from "@/lib/hooks";
import PasswordIcon from '@mui/icons-material/Password';
import Button from '@mui/material/Button';
import { findUser, deletePost } from "../api/route";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { styButton } from "@/components/Styles/styles";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

function stringToColor(string) {
    let hash = 0;
    let i;
    /* eslint-disable no-bitwise */
    for (i = 0; i < string.length; i += 1) {
        hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (i = 0; i < 3; i += 1) {
        const value = (hash >> (i * 8)) & 0xff;
        color += `00${value.toString(16)}`.slice(-2);
    }
    /* eslint-enable no-bitwise */
    return color;
}

function stringAvatar(name) {
    return {
        sx: {
            bgcolor: stringToColor(name),
        },
        children: `${name.split(' ')[0][0]}${name.split(' ')[1][0]}`,
    };
}

const Account = () => {
    const router = useRouter();
    const [userPost, setUserPost] = useState();
    const currentUser = useAppSelector(selectUser);
    const [open, setOpen] = useState(false);
    const [postId, setPostId] = useState();
    const [openDel, setOpenDel] = useState(false);


    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleClickOpenDel = (id) => {
        setOpenDel(true);
        setPostId(id);
    };
    const handleCloseDel = () => {
        setOpenDel(false);
    };

    const UserPost = async () => {
        try {
            const result = await findUser(currentUser._id);
            setUserPost(result);
        } catch (error) {
            console.log({ error: error })
        }
    }

    useEffect(() => {
        UserPost();
    }, [])
    const handleDelete = async (id) => {
        try {
            const result = await deletePost(id);
            console.log(result);
            Swal.fire({
                toast: true,
                icon: "success",
                iconColor: "white",
                position: "bottom",
                color: "white",
                title: "Publicación eliminada correctamente.",
                background: "#a5dc86",
                showConfirmButton: false,
                timer: 2000,
                timerProgressBar: true,
            });
            UserPost();
        } catch (error) {
            console.log({ error: error })
        }
    }

    return (
        <Fragment>
            <NavBar />
            <Container sx={{ mt: { md: '5vh', xs: '2vh' }, mb: 3 }} maxWidth="md">
                <Grid container spacing={4}>
                    <Grid item xs={12} md={6}>
                        <Button variant="contained" sx={styButton} onClick={() => router.push("/")}>
                            <ArrowBackIcon sx={{ color: "white" }} />
                        </Button>
                    </Grid>
                </Grid>
            </Container>
            <Container maxWidth='md' sx={{ bgcolor: 'white', display: 'flex', justifyContent: 'space-between', p: 4, height: '100%', borderRadius: '25px' }}>
                <Grid item sx={{ mt: { xs: -25, md: 0 } }}>
                    <Typography variant="h5" fontWeight={'bold'} sx={{ color: "#3B3561" }}>
                        Eventos publicados:
                    </Typography>
                    <Grid item sx={{ borderRadius: '20px', width: '100px' }}>
                        {userPost?.posts.map((item, idx) => {
                            return (
                                <Grid container key={idx} sx={{ display: 'flex', p: 2, width: "400px" }}>
                                    <Grid item sx={{ width: "500px" }} >
                                        <Typography variant="h5" sx={{ fontWeight: 'bolder', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {item.title}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" mt={2} sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {item.description}
                                        </Typography>
                                        <Grid item sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                            <IconButton onClick={() => router.push(`/posts/edit/${item._id}`)}>
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton onClick={() => handleClickOpenDel(item._id)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </Grid>
                                        <Divider sx={{ width: '100%', mt: 2 }} />
                                    </Grid>
                                </Grid>
                            );
                        })}
                    </Grid>
                </Grid>
                <Grid container md={6} sx={{}} >
                    <Grid item sx={{ height: { xs: '10vh', md: '30vh' }, mt: 2 }}>
                        <Grid item sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Avatar {...stringAvatar(`${currentUser.firstName} ${currentUser.lastName}`)} sx={{ height: '4rem', width: '4rem' }} />
                            <Typography variant="h4">
                                {currentUser.firstName} {currentUser.lastName}
                            </Typography>
                        </Grid>
                        <Grid item sx={{ display: 'flex', gap: '20px', mt: 3 }}>
                            <AttachEmailOutlinedIcon sx={{ color: "#3B3561" }} />
                            <Typography sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentUser.email}</Typography>
                        </Grid>
                        <Grid item sx={{ display: 'flex', gap: '20px', mt: 3 }}>
                            <PasswordIcon sx={{ color: "#3B3561" }} />
                            <Typography sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>********</Typography>
                        </Grid>

                    </Grid>
                </Grid>
                <Dialog
                    open={openDel}
                    onClose={handleCloseDel}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title" sx={{ color: "#3B3561" }}>
                        {"¿Está seguro que desea eliminar esta publicación?"}
                    </DialogTitle>
                    <DialogActions>
                        <Button onClick={handleCloseDel} sx={{ color: "#3B3561", '&:hover': { backgroundColor: "#EFEEF6" } }}>Cancelar</Button>
                        <Button
                            onClick={() => {
                                handleCloseDel();
                                handleDelete(postId);
                            }}
                            sx={{ color: "#3B3561", '&:hover': { backgroundColor: "#EFEEF6" } }}
                            autoFocus>
                            Eliminar
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </Fragment>
    )
}

export default Account;