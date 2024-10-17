require('dotenv').config();
const cookieParser = require('cookie-parser');
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 8000;

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
    cors({
        credentials: true,
        origin: ['http://localhost:3000', 'https://eventorganizerpy.netlify.app'], // Added your deployed frontend URL
    })
);


require("./config/mongoose.config");


const sessionRoutes = require("./routes/session.routes");
app.use('/api/session', sessionRoutes);

const userRoutes = require("./routes/user.routes");
app.use('/api/user', userRoutes);

const postRoutes = require("./routes/post.routes");
app.use('/api/post', postRoutes);

app.listen(port, () => console.log(`Listening on port: ${port}`));
