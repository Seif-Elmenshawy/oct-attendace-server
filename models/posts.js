import mongoose from "mongoose";

const schema = mongoose.Schema()

const postSchema = new mongoose.Schema({
    title: String,
    body: String,
    picLink: String,
    anonymous: Boolean
})

const Post = mongoose.model('Posts', postSchema)

export default(Post)