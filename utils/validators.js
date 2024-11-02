import mongoose from "mongoose";
import z from "zod";

function isValidObjectId(id) {
    return mongoose.isValidObjectId(id);
}

const registerSchema = z.object({
    name: z
        .string({
            required_error: "Name is required",
            invalid_type_error: "Name must be a string",
        })
        .trim()
        .min(1, "Username cannot be empty"),
    email: z
        .string({
            required_error: "Email is required",
            invalid_type_error: "Email must be a string",
        })
        .trim()
        .email("Invalid email format"),
});

const emailSchema = registerSchema.pick({ email: true });

const taskSchema = z.object({
    title: z
        .string({
            required_error: "Title is required",
            invalid_type_error: "Title must be a string",
        })
        .trim()
        .min(1, "Title cannot be empty"),
    priority: z.enum(["High Priority", "Moderate Priority", "Low Priority"], {
        message:
            "Priority can only be 'High Priority' , 'Moderate Priority' , 'Low Priority'",
    }),
});

const updateTaskSchema = taskSchema.extend({
    status: z.enum(["Backlog", "Todo", "In Progress", "Done"], {
        message:
            "Task status can only be 'Backlog', 'Todo', 'In Progress', 'Done' ",
    }),
    public: z.boolean().optional(),
});

// custom password validator, same as frontend
function passwordValidate(password) {
    if (!password) {
        return { valid: false, error: true, message: "Password is required" };
    }
    let valid = true;
    let error = false;
    let message = "Password cannot be empty";
    if (password === "") {
        valid = false;
        error = true;
    } else if (password.length < 8) {
        valid = false;
        error = true;
        message = "Password cannot be less than 8 characters.";
    } else if (password.search(/[!@#$%^&*._\-\+=]/) === -1) {
        valid = false;
        error = true;
        message =
            "Password must containe atleast one of these characters !@#$%^&*._-+=";
    } else if (password.search(/[A-Z]/) === -1) {
        valid = false;
        error = true;
        message = "Password must containe atleast one capital letter A-Z";
    } else if (password.search(/[a-z]/) === -1) {
        valid = false;
        error = true;
        message = "Password must containe atleast one small letter a-z";
    } else if (password.search(/[0-9]/) === -1) {
        valid = false;
        error = true;
        message = "Password must containe atleast one number 0-9";
    }

    return { valid, error, message };
}

// custom todo/checklist validator for tasks
function validateTodos(todos) {
    if (!todos) {
        return { valid: false, message: "Must have aleast one todo" };
    }

    if (todos.length === 0) {
        return { valid: false, message: "Must have aleast one todo" };
    }

    for (let todo of todos) {
        todo.task = todo.task?.trim();
        if (!todo.task || todo.task === "") {
            return { valid: false, message: "A todo cannot be empty" };
        }
        if (todo.done !== true && todo.done !== false) {
            return {
                valid: false,
                message: "A todo must have done status true or false",
            };
        }
    }
    return { valid: true, message: "A valid todo list" };
}

export {
    registerSchema,
    emailSchema,
    taskSchema,
    updateTaskSchema,
    isValidObjectId,
    passwordValidate,
    validateTodos,
};
