import mongoose from "mongoose";
import bcrypt from 'bcrypt'

const userSchema = new mongoose.Schema({
    email: String,
    userName: String,
    displayName: String,
    password:String
})

userSchema.pre('save', async function (next) {
        const salt = await bcrypt.genSalt();
        this.password = await bcrypt.hash(this.password, salt);
});



const User = mongoose.model("users", userSchema)

export default User