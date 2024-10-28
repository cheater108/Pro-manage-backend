import { Router } from "express";
import isLoggedIn from "../middleware/isLoggedIn.js";
import {
    getAdditionalInfo,
    getBoard,
    shareBoard,
} from "../controllers/board.controller.js";
import catchAsync from "../utils/catchAsync.js";

const router = Router();

router.get("/", isLoggedIn, catchAsync(getBoard));
router.get("/info", isLoggedIn, catchAsync(getAdditionalInfo));
router.post("/share", isLoggedIn, catchAsync(shareBoard));

export default router;
