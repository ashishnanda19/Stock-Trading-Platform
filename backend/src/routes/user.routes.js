import { Router } from "express";
import { buystock, deleteUser, getAllTransactionHistory, getAllUserStocks, getBoard, getWallet, loginUser, logoutUser, refreshAccessToken, registerUser, sellStock } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import rateLimiter from "../utils/rateLimiter.js";

const router=Router()
router.post("/register",rateLimiter({capacity:2,refillRate:1}),registerUser)
router.post("/login",rateLimiter({capacity:10,refillRate:1}),loginUser)
router.post("/delete",rateLimiter({capacity:10,refillRate:1}),deleteUser)
router.post("/logout",verifyJWT,rateLimiter({capacity:5,refillRate:1}),logoutUser)
router.post("/refresh-token",verifyJWT,rateLimiter({capacity:5,refillRate:1}),refreshAccessToken)
router.post("/buy-stock",verifyJWT,rateLimiter({capacity:5,refillRate:1}),buystock)
router.get("/get-all-stocks",verifyJWT,rateLimiter({capacity:5,refillRate:1}),getAllUserStocks)
router.get("/get-all-trans",verifyJWT,rateLimiter({capacity:5,refillRate:1}),getAllTransactionHistory)
router.patch("/sell-stock",verifyJWT,rateLimiter({capacity:5,refillRate:1}),sellStock)
router.patch("/leaderboard",verifyJWT,rateLimiter({capacity:5,refillRate:1}),getBoard)
router.get("/get-wallet",verifyJWT,rateLimiter({capacity:5,refillRate:1}),getWallet)
export {router as userRouter};