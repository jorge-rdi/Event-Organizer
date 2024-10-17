import { Fragment } from "react";
import { Avatar, Box, Container, Typography } from "@mui/material";
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Link from "next/link";

const FormWrapper = ({ children }) => {
    const Copyright = (value) => {
        return (
            <Typography variant="body2" color="text.secondary" align="center" {...value}>
                {'Copyright © '}
                <Link
                    color="inherit"
                    href="/"
                    style={{
                        textDecoration: 'none',
                        boxShadow: 'none',
                        color: 'black'
                    }}>
                    EventOrganizer
                </Link>{' '}
                {new Date().getFullYear()}
                {'.'}
            </Typography >
        );
    }
    return (
        <Fragment>
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="100vh">
                <Container component="main" maxWidth="xs" disableGutters={true}>{/**Coloca como un componente MAIN y lo dejo su maxWidth a xs O 12 */}
                    <Box
                        sx={{
                            padding: 5,
                            mb: 5,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'radial-gradient(circle, rgba(255, 255, 255, 1) 0%, rgba(200, 200, 200, 1) 100%)',



                            borderRadius:'10px'
                        }}
                    >
                        <Avatar sx={{ m: 1, bgcolor: 'black' }}>
                            <LockOutlinedIcon />
                        </Avatar>
                        {children}
                        <Copyright sx={{ mt: 5 }} />
                    </Box>
                </Container>
            </Box>
        </Fragment >
    )
}

export default FormWrapper;