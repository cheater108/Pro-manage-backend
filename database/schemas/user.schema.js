import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    board: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Board",
    },
});

const User = mongoose.model("User", userSchema);

export default User;
