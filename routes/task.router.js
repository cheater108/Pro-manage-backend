import { Router } from "express";
import {
    deleteTask,
    getPublicTask,
    postTask,
    updateTask,
} from "../controllers/task.controller.js";
import isLoggedIn from "../middleware/isLoggedIn.js";

const router = Router();

router.post("/", isLoggedIn, postTask);
router.put("/:id", isLoggedIn, updateTask);
router.delete("/:id", isLoggedIn, deleteTask);

router.get("/public/:id", getPublicTask);

export default router;
