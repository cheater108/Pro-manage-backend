import { Router } from "express";
import isLoggedIn from "../middleware/isLoggedIn.js";
import {
    getAdditionalInfo,
    getBoard,
    shareBoard,
} from "../controllers/board.controller.js";

const router = Router();

router.get("/", isLoggedIn, getBoard);
router.get("/info", isLoggedIn, getAdditionalInfo);
router.post("/share", isLoggedIn, shareBoard);

export default router;
