import { Router } from "express";
import {
    editUser,
    getUsers,
    loginUser,
    registerUser,
} from "../controllers/user.controller.js";
import isLoggedIn from "../middleware/isLoggedIn.js";

const router = Router();

router.get("/", isLoggedIn, getUsers);
router.post("/edit", isLoggedIn, editUser);
router.post("/login", loginUser);
router.post("/register", registerUser);

export default router;
