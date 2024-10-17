const Post = require("../models/post.model");
const User = require("../models/user.model");

module.exports.findAllPosts = async (req, res) => {
    try {
        const post = await Post.find().populate("user");
        res.status(200);
        res.json(post);
    } catch (error) {
        res.status(500);
        res.json({ error: error });
    }
};
module.exports.findPost = async (req, res) => {
    const { id } = req.params;
    try {
        const post = await Post.findOne({ _id: id }).populate("user");
        if (post) {
            res.status(200);
            res.json(post);
            return;
        }
        res.status(404);
        res.json({ error: "Post no encontrado" });
    } catch (error) {
        res.status(500);
        res.json({ error: error });
    }
};
module.exports.createPost = async (req, res) => {
    try {
        const { title, date, description, location, user } = req.body;

        // Verifica que todos los campos requeridos estén presentes en la solicitud
        if (!title || !date || !description || !location || !user) {
            return res.status(400).json({ error: "Faltan campos obligatorios." });
        }

        // Crea un nuevo post usando los datos de la solicitud
        const newPost = await Post.create({
            title,
            date,
            description,
            location,
            user
        });

        // Añade el post al usuario en su lista de transacciones
        const userId = user;
        const updatedUser = await User.findByIdAndUpdate(userId, { $push: { posts: newPost._id } }, { new: true });

        // Enviar respuesta con el nuevo post
        res.status(201).json(newPost);
        console.log("¡Post creado exitosamente!");
    } catch (error) {
        // Registra los detalles del error en el servidor
        console.error("Error al crear el post:", error);
        // Enviar una respuesta de error genérica al cliente
        res.status(500).json({ error: "Se produjo un error al procesar la solicitud." });
    }
};

module.exports.updatePost = async (req, res) => {
    const { id } = req.params;
    try {
        const updatedPost = await Post.findOneAndUpdate({ _id: id }, req.body, { new: true, runValidators: true });
        res.status(200);
        res.json(updatedPost);

    } catch (error) {
        res.status(500);
        res.json({ error: error });
    }
};
module.exports.deletePost = async (req, res) => {
    try {
        const postId = req.params.id;

        // Busca el usuario que tenga el post
        const user = await User.findOneAndUpdate(
            { posts: postId },
            { $pull: { posts: postId } }
        );

        if (!user) {
            res.status(404);
            return res.json({ error: "User not found" });
        }

        const deletedPost = await Post.deleteOne({ _id: postId });

        res.status(200);
        res.json(deletedPost);

    } catch (error) {
        res.status(500);
        res.json({ error: error });
    }
};
