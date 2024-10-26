import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    priority: {
        type: String,
        enum: ["High Priority", "Moderate Priority", "Low Priority"],
        required: true,
        default: "Low Priority",
    },
    status: {
        type: String,
        enum: ["Backlog", "Todo", "In Progress", "Done"],
        default: "Todo",
    },
    checklist: [
        {
            task: String,
            done: Boolean,
        },
    ],

    assign_to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },

    assigned_email: {
        type: String,
    },

    creator: {
        type: String,
    },
    due_date: {
        type: Date,
    },
    public: {
        type: Boolean,
        default: false,
    },
});

const Task = mongoose.model("Task", taskSchema);

export default Task;
