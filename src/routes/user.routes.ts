import express from "express";
import { authenticate } from "../middlewares/auth.middleware";
import UserController from "../controllers/user.controller";

const router = express.Router();

router.get("/profile", authenticate, UserController.getUserProfile);
router.put("/update", authenticate, UserController.updateUser);

export default router;
