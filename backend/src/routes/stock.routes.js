import { Router } from "express";
import { addStocks, getAllStocks, getGraphStock } from "../controllers/stock.controller.js";
const router=Router()
router.post("/add",addStocks)
router.get("/get-all",getAllStocks)
router.get("/get-graph",getGraphStock)
export {router as stockRouter}