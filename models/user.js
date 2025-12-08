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

userSchema.statics.login = async function(email, password){
    const user = await this.findOne({email})
    if(user){
        const auth = bcrypt.compare(password, user.password)
        if(auth){
            return user
        }
        throw Error("Incorrect Password")
    }
    throw Error('Incorret Email')
}

const User = mongoose.model("users", userSchema)

export default User