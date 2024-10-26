import mongoose from "mongoose";
import z from "zod";

function isValidObjectId(id) {
    return mongoose.isValidObjectId(id);
}

export { isValidObjectId };
