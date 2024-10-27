import Board from "../database/schemas/board.schema.js";
import User from "../database/schemas/user.schema.js";
import { filter, getWeekDates, reverseArray } from "../utils/helpers.js";

// classify tasks into groups by status
function classifyTasks(tasks, filter_by, todo, backlog, inprogress, done) {
    // to change the order of tasks
    // const reverse_tasks = reverseArray(tasks);

    const { week_start, week_end } = getWeekDates();
    for (const task of tasks) {
        if (!filter(task, filter_by, week_start, week_end)) {
            continue;
        }
        switch (task.status) {
            case "Todo":
                // to check if task already added or not
                if (!todo.hash.has(task._id.toString())) {
                    todo.arr.push(task);
                    todo.hash.add(task._id.toString());
                }
                break;
            case "Backlog":
                if (!backlog.hash.has(task._id.toString())) {
                    backlog.arr.push(task);
                    backlog.hash.add(task._id.toString());
                }
                break;
            case "In Progress":
                if (!inprogress.hash.has(task._id.toString())) {
                    inprogress.arr.push(task);
                    inprogress.hash.add(task._id.toString());
                }
                break;
            case "Done":
                if (!done.hash.has(task._id.toString())) {
                    done.arr.push(task);
                    done.hash.add(task._id.toString());
                }
                break;
            default:
                break;
        }
    }
}

// get tasks from shared board
function getBoardTasks(board, filter_by, todo, backlog, inprogress, done) {
    classifyTasks(board.tasks, filter_by, todo, backlog, inprogress, done);
    classifyTasks(
        board.assigned_task,
        filter_by,
        todo,
        backlog,
        inprogress,
        done
    );
}

// for get board tasks
async function getBoard(req, res) {
    const user = req.user;
    const filter = req.query.filter || "All";
    const backlog = { arr: [], hash: new Set() };
    const todo = { arr: [], hash: new Set() };
    const inprogress = { arr: [], hash: new Set() };
    const done = { arr: [], hash: new Set() };

    const board = await Board.findById(user.board_id)
        .populate("tasks")
        .populate("assigned_task")
        .populate({
            path: "shared_boards",
            populate: {
                path: "tasks",
            },
        })
        .populate({
            path: "shared_boards",
            populate: {
                path: "assigned_task",
            },
        });

    if (!board) {
        return res.status(404).json({ error: "no board found" });
    }

    for (const b of board.shared_boards) {
        getBoardTasks(b, filter, todo, backlog, inprogress, done);
    }

    getBoardTasks(board, filter, todo, backlog, inprogress, done);

    res.json({
        todo: todo.arr,
        backlog: backlog.arr,
        inprogress: inprogress.arr,
        done: done.arr,
    });
}

// share board with other users
async function shareBoard(req, res) {
    const { share_email } = req.body;
    const user = await User.findOne({ email: share_email });
    if (!user) {
        return res.status(404).json({ error: "no such user" });
    }
    await Board.findOneAndUpdate(
        { _id: user.board, shared_boards: { $nin: req.user.board_id } },
        { $push: { shared_boards: req.user.board_id } }
    );
    res.json({ message: "successfully shared board" });
}

// for analytics info about count of high, moderate, low, due date tasks
async function getAdditionalInfo(req, res) {
    const user = req.user;
    const info = {
        high: { count: 0, hash: new Set() },
        moderate: { count: 0, hash: new Set() },
        low: { count: 0, hash: new Set() },
        due: { count: 0, hash: new Set() },
    };
    const board = await Board.findById(user.board_id)
        .populate("tasks")
        .populate("assigned_task")
        .populate({
            path: "shared_boards",
            populate: {
                path: "tasks",
            },
        })
        .populate({
            path: "shared_boards",
            populate: {
                path: "assigned_task",
            },
        });

    if (!board) {
        return res.status(404).json({ error: "no board found" });
    }

    for (const b of board.shared_boards) {
        getBoardInfo(b, info.high, info.moderate, info.low, info.due);
    }

    getBoardInfo(board, info.high, info.moderate, info.low, info.due);

    res.json({
        high: info.high.count,
        moderate: info.moderate.count,
        low: info.low.count,
        due: info.due.count,
    });
}

// classify tasks into group by priority and due date
function classifyTasksPriority(tasks, high, moderate, low, due) {
    for (const task of tasks) {
        switch (task.priority) {
            case "High Priority":
                if (!high.hash.has(task._id.toString())) {
                    high.count += 1;
                    high.hash.add(task._id.toString());
                }
                break;

            case "Moderate Priority":
                if (!moderate.hash.has(task._id.toString())) {
                    moderate.count += 1;
                    moderate.hash.add(task._id.toString());
                }
                break;
            case "Low Priority":
                if (!low.hash.has(task._id.toString())) {
                    low.count += 1;
                    low.hash.add(task._id.toString());
                }
                break;

            default:
                break;
        }

        if (task.due_date && !due.hash.has(task._id.toString())) {
            due.count += 1;
            due.hash.add(task._id.toString());
        }
    }
}

function getBoardInfo(board, high, moderate, low, due) {
    classifyTasksPriority(board.tasks, high, moderate, low, due);
    classifyTasksPriority(board.assigned_task, high, moderate, low, due);
}

export { getBoard, shareBoard, getAdditionalInfo };
