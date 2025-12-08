import jwt from "jsonwebtoken";
import dotenv from 'dotenv'

const requireAuth = (req, res, next)=>{
    const token = req.cookie.jwt
    if(token){
        jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) =>{
            if (err){
                res.status(401).json({authenticated: false})
            }else{
                next()
            }
        }) 
    }
}

export default requireAuth