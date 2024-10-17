'use client'
import { usePostContext } from "@/app/context/PostContext";
import PostForm from "@/components/PostForm/page";
import { createPost } from "../../api/route";
import { Fragment } from "react";
import Swal from "sweetalert2";

const newPosts = () => {
    const newPost = async (data, onSuccess, onFail) => {
        try {
            const result = await createPost(data);
            Swal.fire({
                toast: true,
                icon: "success",
                iconColor: "white",
                position: "bottom",
                color: "white",
                title: "Evento creado correctamente.",
                background: "#a5dc86",
                showConfirmButton: false,
                timer: 2000,
                timerProgressBar: true,
            });
            onSuccess(result);
        } catch (error) {
            onFail(error);
            Swal.fire({
                toast: true,
                icon: "error",
                iconColor: "red",
                position: "bottom",
                color: "white",
                title: "Error al crear evento.",
                background: "tomato",
                showConfirmButton: false,
                timer: 2000,
                timerProgressBar: true,
            });
            console.log({error:error});
        }
    }
    return (
        <Fragment>
            <PostForm onSubmit={newPost} />
        </Fragment >
    )
}
export default newPosts;
