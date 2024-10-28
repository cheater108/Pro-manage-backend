import { Router } from "express";
import {
    editUser,
    getUsers,
    loginUser,
    registerUser,
} from "../controllers/user.controller.js";
import isLoggedIn from "../middleware/isLoggedIn.js";
import catchAsync from "../utils/catchAsync.js";

const router = Router();

router.get("/", isLoggedIn, catchAsync(getUsers));
router.post("/edit", isLoggedIn, catchAsync(editUser));
router.post("/login", loginUser);
router.post("/register", registerUser);

export default router;
