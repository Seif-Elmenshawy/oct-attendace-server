import express from 'express'
import mongoose from 'mongoose'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import cors from 'cors'
import * as z from 'zod'
import Post from './models/posts.js'
import User from './models/user.js'
import requireAuth from './middleware/auth.js'

const app = express()
const PORT = process.env.PORT || 3000;
const corsConfig={
    origin:'http://localhost:5173'
}
dotenv.config()
app.use(cors(corsConfig));
app.use(express.json())
app.use(cookieParser())

const maxAge = 30*24*60*60
const createToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn:maxAge})
}


const db = process.env.MONGO_SECRET
mongoose.connect(db)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("Connection error:", err));


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
app.get('/posts', async (req, res) => {
    try {
        const posts = await Post.find()
        res.json(posts)
        console.log(posts)
    } catch (error) {
        res.status(500).json({ message: 'Error fetching posts', error: error.message });
    }
})
app.get('/search', async (req, res)=>{
    try {
        const searchPara = req.body
        if (!searchPara){
            res.status(400).json({message:"Enter something to search for"})
        }
        const result = await Post.find({body:{ $regex: searchPara.parameter, $options: "i" }} )
        res.json(result)
    } catch (error) {
        res.json({message:error})
    }
})
app.post('/signup', async (req, res)=>{
    try {
        const data = req.body
        const userValidationSchema = z.object({
            email: z.string().regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Please enter a valid Email"),
            userName: z.string().regex(/^(?=.*[a-z])(?=.*[A-Z])[A-Za-z0-9!@#$%^&*._-]{6,}$/, "The username must contain at least a lower case letter, an upper case letter, and a number or a special character"),
            password: z.string().min(8).max(32)
        })
        const result = await userValidationSchema.safeParseAsync({
            email: data.email,
            userName:data.userName,
            password: data.password
        })
        if(!result.success){
        return res.status(400).json(result.error.issues[0])
        }
        const user = await User.create({
            email: data.email,
            userName: data.userName,
            displayName: data.displayName,
            password: data.password
        })
        const token = createToken(user._id)
        res.cookie('jwt', token, {httpOnly: true, maxAge: maxAge * 1000} )
        res.json({meesage: "User created successfully", userID: user._id})
    } catch (error) {
        console.error(error); // log the real error
        return res.status(500).json({ message: "Error creating the user" });
    }
})
app.post("/login", async (req, res)=>{
    const {email, password} = req.body
    try {
        const user = await User.login(email,password)
        const token = createToken(user._id)
        res.cookie('jwt', token, {httpOnly: true, maxAge: maxAge * 1000} )
        res.status(200).json({
            message:"User logged in successfully",
            userID: user._id
        })
    } catch (error) {
        res.status(500).json({message:"Server error during loging in"})
    }
})

app.get('/authState', (req, res)=>{
    const token = req.cookies.jwt
        if(token){
            jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) =>{
                if (err){
                    res.status(401).json({authenticated: false})
                }else{
                    res.json({authenticated:true})
                }
            }) 
        }
})

app.listen(PORT, ()=>{
    console.log(`server running on http://localhost:${PORT}`)
})