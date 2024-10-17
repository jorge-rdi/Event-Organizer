const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
    title: {
        type: String,
        required:[true, "El título es obligatorio."],
        trim: true,
        minLength: [5, "Debe ser mayor a 5 caracter."],
        maxLength: [190, "Debe ser menor a 190 caracteres."]
    },
    date: {
        type: String,
        required:[true, "La fecha es obligatoria."]
    },
    description: {
        type: String,   
        required:[true, "La descripción es obligatoria."],
        trim: true,
        minLength: [1, "Debe ser mayor a 1 caracter."],
        maxLength: [1000, "Debe ser menor a 1000 caracteres."]
    },
    location: {
        type: Array,
        required:[true, "La ubicación es obligatoria."],
    },
    user: { 
        type: mongoose.Types.ObjectId, 
        ref: "User"
    }
}, { timestamps: true, versionKey:false});


const Post = new mongoose.model("Post", PostSchema);

module.exports = Post;