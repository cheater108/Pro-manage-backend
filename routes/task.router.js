import { Router } from "express";
import {
    deleteTask,
    getPublicTask,
    postTask,
    updateTask,
} from "../controllers/task.controller.js";
import isLoggedIn from "../middleware/isLoggedIn.js";
import isAuthorized from "../middleware/isAuthorized.js";
import catchAsync from "../utils/catchAsync.js";

const router = Router();

router.post("/", isLoggedIn, catchAsync(postTask));
router.put("/:id", isLoggedIn, isAuthorized, catchAsync(updateTask));
router.delete("/:id", isLoggedIn, isAuthorized, catchAsync(deleteTask));

router.get("/public/:id", catchAsync(getPublicTask));

export default router;
