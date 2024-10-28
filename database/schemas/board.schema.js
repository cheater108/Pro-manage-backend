import mongoose from "mongoose";

const boardSchema = new mongoose.Schema({
    // my own tasks references
    tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }],

    // boards shared with me
    shared_boards: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Board",
        },
    ],

    // tasks assigned to me
    assigned_task: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }],
});

const Board = mongoose.model("Board", boardSchema);

export default Board;
