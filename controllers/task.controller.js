import Board from "../database/schemas/board.schema.js";
import Task from "../database/schemas/task.schema.js";
import User from "../database/schemas/user.schema.js";
import { isOwner } from "../utils/helpers.js";
import {
    isValidObjectId,
    taskSchema,
    updateTaskSchema,
    validateTodos,
} from "../utils/validators.js";

async function postTask(req, res) {
    const data = req.body;

    if (!isValidObjectId(req.user.board_id)) {
        return res
            .status(400)
            .json({ error: "No board found, please login again" });
    }

    const board = await Board.findById(req.user.board_id);
    const assignedUser = await User.findOne({ email: data.assigned_email });

    // zod validation
    const taskParse = taskSchema.safeParse(data);
    if (!taskParse.success) {
        return res.status(400).json({ error: taskParse.error });
    }
    // cutom todos validation
    const todosParse = validateTodos(data.checklist);
    if (!todosParse.valid) {
        return res.status(400).json({ error: todosParse.message });
    }

    const task = new Task({
        title: data.title,
        priority: data.priority,
        checklist: data.checklist,
        due_date: data.due_date,
        creator: req.user.email,
    });

    if (assignedUser) {
        task.assign_to = assignedUser._id;
        task.assigned_email = assignedUser.email;
        await Board.findByIdAndUpdate(assignedUser.board, {
            $push: { assigned_task: task._id },
        });
    }

    board.tasks.push(task._id);
    await task.save();
    await board.save();
    res.status(201).json({ message: "task created" });
}

async function updateTask(req, res) {
    const taskData = req.body;

    const taskParse = updateTaskSchema.safeParse(taskData);
    if (!taskParse.success) {
        return res.status(400).json({ error: taskParse.error });
    }
    const todosParse = validateTodos(taskData.checklist);
    if (!todosParse.valid) {
        return res.status(400).json({ error: todosParse.message });
    }

    // due to isAuthorized middleware req will already have task data
    const task = req.task;
    if (!task) {
        return res.status(400).json({ error: "no suck task found" });
    }
    task.title = taskData.title;
    task.priority = taskData.priority;
    task.status = taskData.status;
    task.checklist = taskData.checklist;
    task.due_date = taskData.due_date;
    if (taskData.public) {
        task.public = taskData.public;
    }

    // editing assigned user,
    // only creator can edit the assigned user
    if (isOwner(req.user.email, task.creator) && taskData.assign_to !== "") {
        const new_assigned = await User.findOne({
            email: taskData.assigned_email,
        });
        if (new_assigned) {
            // if assigning after the creation of task
            if (!task.assign_to) {
                task.assign_to = new_assigned._id;
                task.assigned_email = new_assigned.email;
                await Board.findByIdAndUpdate(new_assigned.board, {
                    $push: { assigned_task: task._id },
                });
            }

            // check if new assigned user is different
            else if (
                new_assigned._id.toString() !== task.assign_to.toString()
            ) {
                const old_assigned = await User.findById(task.assign_to);
                if (old_assigned) {
                    await Board.findByIdAndUpdate(old_assigned.board, {
                        $pull: { assigned_task: task._id },
                    });
                    await Board.findByIdAndUpdate(new_assigned.board, {
                        $push: { assigned_task: task._id },
                    });
                }
                task.assign_to = new_assigned._id;
                task.assigned_email = new_assigned.email;
            }
        }
    }

    await task.save();
    return res.status(201).json({ message: "successfully updated task" });
}

async function deleteTask(req, res) {
    const { id } = req.params;

    const task = req.task;
    if (!task) {
        return res.status(400).json({ error: "no suck task found" });
    }
    if (task.assign_to) {
        // deleting reference from assigned user
        const assignedUser = await User.findById(task.assign_to);
        await Board.findByIdAndUpdate(assignedUser.board, {
            $pull: { assigned_task: id },
        });
    }

    const creator = await User.findOne({ email: task.creator });
    await Board.findByIdAndUpdate(creator.board, { $pull: { tasks: id } });
    await Task.findByIdAndDelete(id);

    return res.json({ message: "successfully deleted task" });
}

// get publicly shared task
async function getPublicTask(req, res) {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
        console.log("here");
        return res.status(404).json({ error: "no such task" });
    }

    const task = await Task.findById(id);

    // task needs to be set public, to be able to view publicly
    if (!task || !task.public) {
        return res.status(404).json({ error: "no such task" });
    }
    res.json(task);
}

export { postTask, updateTask, deleteTask, getPublicTask };
