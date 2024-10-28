import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./database/connectDB.js";
import userRouter from "./routes/user.router.js";
import boardRouter from "./routes/board.router.js";
import taskRouter from "./routes/task.router.js";
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/v1/user", userRouter);
app.use("/api/v1/board", boardRouter);
app.use("/api/v1/task", taskRouter);

app.get("/health", (req, res) => {
    res.json({ message: "hello" });
});

app.listen(process.env.PORT, () => {
    console.log("server started on port", process.env.PORT);
    connectDB();
});
