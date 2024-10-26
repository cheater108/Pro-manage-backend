import mongoose from "mongoose";

function connectDB() {
    if (process.env.ENV === "LOCAL") {
        mongoose
            .connect(process.env.MONGO_LOCAL, {
                dbName: "Pro-manage",
            })
            .then(() => console.log("connected to local mongodb"))
            .catch(() => console.log("Error connecting to db"));
    } else {
        mongoose
            .connect(process.env.MONGO_ATLAS, {
                dbName: "Pro-manage",
            })
            .then(() => console.log("connected to mongodb atlas"))
            .catch(() => console.log("Error connecting to db"));
    }
}

export default connectDB;
