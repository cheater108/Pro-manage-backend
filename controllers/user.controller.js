import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../database/schemas/user.schema.js";
import Board from "../database/schemas/board.schema.js";
import Task from "../database/schemas/task.schema.js";
import { passwordValidate, registerSchema } from "../utils/validators.js";

async function getUsers(req, res) {
    const users = await User.find({ _id: { $ne: req.user.id } }).select(
        "email -_id"
    );
    res.json({ users });
}

async function loginUser(req, res) {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email?.toLowerCase() });

    if (!user) {
        return res.status(400).json({ error: "wrong email or password" });
    }
    const correctPassword = await bcrypt.compare(password, user.password);
    if (!correctPassword) {
        return res.status(400).json({ error: "wrong email or password" });
    }
    const token = jwt.sign(
        {
            email: user.email,
            id: user._id,
            board_id: user.board,
            name: user.name,
        },
        process.env.SECRET_KEY,
        {
            expiresIn: "30d",
        }
    );
    res.json({ token, email: user.email, name: user.name });
}

async function registerUser(req, res) {
    const { name, email, password } = req.body;

    // zod parse
    const userParse = registerSchema.safeParse({ name, email });
    if (!userParse.success) {
        return res.status(400).json({ error: userParse.error });
    }

    // custom password validation
    const passwordParse = passwordValidate(password);
    if (!passwordParse.valid) {
        return res.status(400).json({ error: passwordParse.message });
    }

    // dont create user if already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({ error: "email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const board = new Board();
    const user = new User({
        name,
        email,
        password: hashedPassword,
        board: board._id,
    });
    await board.save();
    await user.save();
    res.status(201).json({ success: "user created" });
}

async function editUser(req, res) {
    const user_id = req.user.id;
    const data = req.body;

    // only allow one thing to change at a time i.e either name , email or password
    if (
        data.name.length > 0 &&
        data.email.length === 0 &&
        data.new_password.length === 0
    ) {
        await User.findByIdAndUpdate(user_id, { name: data.name });
        return res.json({ message: "Edited successfully" });
    } else if (
        data.email.length > 0 &&
        data.name.length === 0 &&
        data.new_password.length === 0
    ) {
        const new_email = data.email?.toLowerCase();

        // if new_email already exists dont update email
        const emailAlready = await User.findOne({ email: new_email });
        if (emailAlready) {
            return res.status(400).json({ error: "This email already exists" });
        }

        // update user email
        await User.findByIdAndUpdate(user_id, { email: new_email });
        const board = await Board.findById(req.user.board_id);

        // update all tasks where previous email was owner
        for (const task_id of board.tasks) {
            await Task.findByIdAndUpdate(task_id, { creator: new_email });
        }

        // update tasks where email was assigned the task
        for (const task_id of board.assigned_task) {
            await Task.findByIdAndUpdate(task_id, {
                assigned_email: new_email,
            });
        }
        return res.json({ message: "Edited successfully" });
    } else if (
        data.new_password.length > 0 &&
        data.name.length === 0 &&
        data.email.length === 0
    ) {
        const user = await User.findById(user_id);

        // check if current password provided is correct
        const correctPass = await bcrypt.compare(data.password, user.password);
        if (!correctPass) {
            return res
                .status(400)
                .json({ error: "Current password is incorrect" });
        }

        // check/validate new password
        const passwordParse = passwordValidate(new_password);
        if (!passwordParse.valid) {
            return res.status(400).json({ error: passwordParse.message });
        }

        // hash and store new password
        user.password = await bcrypt.hash(data.new_password, 10);
        await user.save();

        return res.json({ message: "Edited successfully" });
    }

    // error if changing multiple fields
    res.status(400).json({
        error: "Can only change one thing at a time. (name, email, password)",
    });
}

export { getUsers, registerUser, loginUser, editUser };
