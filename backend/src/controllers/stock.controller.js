import asyncHandler from "../utils/asyncHandler.js";
import { pool } from "../db/index.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
const addStocks=asyncHandler(async(req,res)=>{
    const stocks =req.body.stocks
    if(!stocks || stocks.length===0) throw new ApiError(400,"No Stocks Provided")
    const insertedStocks=[]
    for(const stock of stocks){
        const {stock_name,price}=stock
        if(!stock_name || !price) continue
        const [existing]=await pool.query("Select * from stock where stock_name=?",[stock_name])
        if(existing.length>0) continue
        const [result]= await pool.query("Insert Into Stock (stock_name,price,last_price) VALUES(?,?,?)",[stock_name,price,price])
        insertedStocks.push({stock_id:result.insertId,stock_name,price})
    }
    return res.status(201).json(
        new ApiResponse(201,insertedStocks,"Stocks Inserted SuccesFully")
    )
})
const getAllStocks=asyncHandler(async(req,res)=>{
    const [stock]=await pool.query("Select * from stock")
    return res.status(201).json(
        new ApiResponse(201,stock,"Stocks Fetched SuccesFully")
    )
})
const getGraphStock=asyncHandler(async(req,res)=>{
    const {name,duration}=req.query
    if(!name) throw new ApiError(400,"Please Provide The Name of stock")
    if(!duration || isNaN(duration || duration<=0)) throw new ApiError(400,"Please Provide the Duration")
    const  [graph]=await pool.query(`Select * from stockhistory where stock_name=? ORDER BY created_at ASC Limit ${duration}`,[name])
    if(graph.length===0) throw new ApiError(404,"No Graph Found")
    return res.status(201).json(
        new ApiResponse(201,graph,"Graph points Fetched SuccesFully")
    )
})
export {addStocks,getAllStocks,getGraphStock}