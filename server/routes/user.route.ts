import express from "express";
import { activateUser, loginUser, logoutUser, registrationUser } from "../controllers/user.controller";
import { isAuthenticated } from "../middleware/auth";
const router = express.Router();

router.post("/register", registrationUser);
router.post("/activate-user", activateUser);
router.post("/login",loginUser);
router.get("/logout", isAuthenticated ,logoutUser);
export default router;