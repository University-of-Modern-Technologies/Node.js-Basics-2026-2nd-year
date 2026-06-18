import { Router } from "express";
import { registerValidation, loginValidation } from "../schemas/auth.js";
import { register, login, logout, me } from "../controllers/auth.js";

const router = Router();

router.get("/me", me);
router.post("/register", registerValidation, register);
router.post("/login", loginValidation, login);
router.post("/logout", logout);

export default router;
