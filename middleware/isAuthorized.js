import { isValidObjectId } from "../utils/validators.js";
import Task from "../database/schemas/task.schema.js";
import Board from "../database/schemas/board.schema.js";

async function isAuthorized(req, res, next) {
    const { id } = req.params;

    const user = req.user;
    if (!isValidObjectId(id)) {
        return res.status(400).json({ error: "no such task" });
    }

    const task = await Task.findById(id);
    if (!task) {
        return res.status(400).json({ error: "no such task" });
    }

    req.task = task;

    // if logged in user is owner
    if (user.email === task.creator) {
        return next();
    }

    // if logged in user has been assigned task
    if (user.email === task.assigned_email) {
        return next();
    }

    // or if whole board is shared with logged in user
    const board = await Board.findById(user.board_id);
    for (const shared_board_id of board.shared_boards) {
        const shared_board = await Board.findById(shared_board_id);

        // task can either be original users tasks list
        if (shared_board.tasks.find((t) => t.toString() === id)) {
            return next();
        }
        // or in assigned_tasks of original user
        if (shared_board.assigned_task.find((t) => t.toString() === id)) {
            return next();
        }
    }

    return res
        .status(401)
        .json({ error: "you not authorized to make this change" });
}

export default isAuthorized;
