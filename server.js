import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import * as z from 'zod'
import Post from './models/posts.js'
import User from './models/user.js'

const app = express()
const port = 3000
const corsConfig={
    origin:'http://localhost:5173'
}
app.use(cors(corsConfig));
app.use(express.json())

const db = 'mongodb://localhost:27017/STEM-WIKI'
mongoose.connect(db).then(()=>app.listen(port, ()=>{
    console.log(`server running on http://localhost:${port}`)
})).catch((err)=>{console.log('connection error')})

app.get('/', (req, res)=>{
    res.send("يا مسهل الحال يا رب")
})

app.post('/add-post', async (req, res)=>{
    try {
        const data = req.body
        const post = new Post({
            title: data.title,
            body: data.body
        })
        const savePost = await post.save()
        res.json({
            message:"Post is uploaded successfully",
            post: savePost
        })
        console.log(data)
    } catch (error) {
        res.status(500).json({
            message: "error uploading the post",
            details:error.message
        })
    }
})
app.get('/posts', (req, res) => {
        
})
app.post('/signup', async (req, res)=>{
    try {
        const data = req.body
        const userValidationSchema = z.object({
            email: z.string().regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/),
            userName: z.string().regex(/^(?=.*[a-z])(?=.*[A-Z])[A-Za-z0-9!@#$%^&*._-]{6,}$/),
            displayName: z.string().min(3),
            password: z.string().min(8).max(32)
        })
        const result = await userValidationSchema.safeParseAsync({
            email: data.email,
            userName:data.userName,
            displayName: data.displayName,
            password: data.password
        })
        if(!result.success){
            return res.status(400).json({
                message: result.error.errors.map(e => e.message)
            });
        }
        const user = new User({
            email: data.email,
            userName: data.userName,
            displayName: data.displayName,
            password: data.password
        })
        const saveUser = await user.save()
        res.json({meesage: "User created successfully"})
    } catch (error) {
        console.error(error); // log the real error
        return res.status(500).json({ message: "Error creating the user" });
    }
})
