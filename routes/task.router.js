import { Router } from "express";
import {
    deleteTask,
    getPublicTask,
    postTask,
    updateTask,
} from "../controllers/task.controller.js";
import isLoggedIn from "../middleware/isLoggedIn.js";
import isAuthorized from "../middleware/isAuthorized.js";

const router = Router();

router.post("/", isLoggedIn, postTask);
router.put("/:id", isLoggedIn, isAuthorized, updateTask);
router.delete("/:id", isLoggedIn, isAuthorized, deleteTask);

router.get("/public/:id", getPublicTask);

export default router;
