import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import jwt from  "jsonwebtoken"
import dotenv from "dotenv"
import { pool } from "../db/index.js";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";
import { hashpassword ,comparepassword} from "../utils/hash.js";
import { getLeaderBoard } from "../utils/BullMQ.js";
dotenv.config()
const generateAccessTokenAndRefereshTokens=async(user)=>{
    try{
        const [rows]=await pool.query('Select * from Users where id=?',[user.id])
        if(rows.length===0) throw new ApiError(404,"User not Found")
        const dbUser=rows[0]
        const accessToken=generateAccessToken(dbUser)
        const refreshToken=generateRefreshToken(dbUser)
        await pool.query("UPDATE Users SET refresh_token=? WHERE id=?", [refreshToken, dbUser.id]);
        return {accessToken,refreshToken}
    }catch(err){
        console.error("Error in generateAccessAndRefereshTokens:", err);
        throw new ApiError(500, "Token generation failed");
    }
}
const registerUser=asyncHandler(async(req,res)=>{
    const {username,email,password} =req.body
    if(!username || !email || !password) throw new ApiError(400,"All Fields Required")
    const [existinguser]=await pool.query("Select id from Users where email=? OR username=?",[email,username])
    if(existinguser.length>0) throw new ApiError(409,"User Already Exsists")
    const hashedpassword=await hashpassword(password)
    const [result]=await pool.query("INSERT INTO Users (username,email,password) VALUES(?,?,?)",[username,email,hashedpassword])
    const user={
        id:result.insertId,username,email
    }
    await pool.query("Insert into wallet(user_id) VALUES(?)",[user.id])
    res.status(201).json(
        new ApiResponse(201,user,"User Registered Successfully")
    )
})
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body
  if (!email || !password)
    throw new ApiError(400, "All fields are required")
  const [rows] = await pool.query(
    "SELECT * FROM Users WHERE email=?",
    [email]
  )
  if (rows.length === 0)
    throw new ApiError(400, "Invalid credentials")
  const dbUser = rows[0]
  const isPasswordValid = await comparepassword(password, dbUser.password)
  if (!isPasswordValid)
    throw new ApiError(400, "Invalid credentials")

  const { accessToken, refreshToken } =
    await generateAccessTokenAndRefereshTokens(dbUser)
  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "strict"
  }
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: { id: dbUser.id, email: dbUser.email, username: dbUser.username } },
        "User logged in successfully"
      )
    )
})
const deleteUser = asyncHandler(async (req, res) => {
  const userId = req.user?.id

  if (!userId) {
    throw new ApiError(401, "Unauthorized request")
  }

  const [result] = await pool.query(
    "DELETE FROM Users WHERE id = ?",
    [userId]
  )

  if (result.affectedRows === 0) {
    throw new ApiError(404, "User not found")
  }

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "strict"
  }

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
      new ApiResponse(
        200,
        {},
        "User deleted successfully"
      )
    )
})

const refreshAccessToken=asyncHandler(async(req,res)=>{
    const incomingRefreshToken=req.cookies.refreshToken || req.body.refreshToken
    if(!incomingRefreshToken) throw new ApiError(401,"Unauthorised Request")
    try{
      const decodedToken=jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
      const [rows]=await pool.query("Select * from Users where id=?",[decodedToken.id])
      if(rows.length===0) throw new ApiError(401,"Invalid Refresh Token Request");
      const dbUser=rows[0]
      if(dbUser.refresh_token!==incomingRefreshToken) throw new ApiError(401,"Refresh Token Expired")
      const options={
        httpOnly:true,
        secure:true
      }
      const {accessToken,refreshToken}=await generateAccessTokenAndRefereshTokens(dbUser)
        return res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",refreshToken,options).json(
            new ApiResponse(200,{accessToken,refreshToken},"Access Token Refreshed Successfully")
        )
    }catch(err){
      throw new ApiError(401,err?.message || "Invalid Refresh Token")
    }
})
const logoutUser=asyncHandler(async(req,res)=>{
    const [rows]=await pool.query("Update Users Set refresh_token=NULL Where id=? ",[req.user.id])
    const options={
        httpOnly:true,///only modify by server(cookie)
        secure:true
    }
    return res.status(200).clearCookie("accessToken",options).clearCookie("refreshToken",options).json(
        new ApiResponse(200,{},"User Logged Out")
    )
})
const buystock = asyncHandler(async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const { name, quantity } = req.body;
    const userid = req.user.id;

    if (!name || !quantity || quantity <= 0)
      throw new ApiError(400, "Please mention the Name And quantity");

    const [rows] = await conn.query(
      "SELECT * FROM stock WHERE stock_name=?",
      [name]
    );
    if (rows.length === 0)
      throw new ApiError(404, "Stock does Not Found");

    const price = rows[0].price;
    const stockId = rows[0].stock_id;
    const totalprice = price * quantity;

    const [wallet] = await conn.query(
      "SELECT * FROM wallet WHERE user_id=? FOR UPDATE",
      [userid]
    );
    if (wallet.length === 0)
      throw new ApiError(404, "No wallet Found");

    if (wallet[0].balance < totalprice)
      throw new ApiError(400, "Insufficient Balance");

    await conn.query(
      "UPDATE wallet SET balance=? WHERE user_id=?",
      [Number(wallet[0].balance) - totalprice, userid]
    );

    const [portfolioRows] = await conn.query(
      "SELECT * FROM portfolios WHERE user_id=? AND stock_id=? FOR UPDATE",
      [userid, stockId]
    );

    if (portfolioRows.length === 0) {
      await conn.query(
        "INSERT INTO portfolios (user_id,stock_id,quantity,avg_buy_price,stock_name) VALUES (?,?,?,?,?)",
        [userid, stockId, quantity, price, name]
      );
    } else {
      const existingQty = portfolioRows[0].quantity;
      const existingAvg = portfolioRows[0].avg_buy_price;
      const newQty = existingQty + quantity;
      const newAvg =
        (existingQty * existingAvg + quantity * price) / newQty;

      await conn.query(
        "UPDATE portfolios SET quantity=?, avg_buy_price=? WHERE user_id=? AND stock_id=?",
        [newQty, newAvg, userid, stockId]
      );
    }

    await conn.query(
      "INSERT INTO Trades (user_id,stock_id,trade_type,quantity,price,total_amount,stock_name) VALUES (?,?, 'BUY', ?, ?, ?, ?)",
      [userid, stockId, quantity, price, totalprice, name]
    );

    await conn.commit();

    res.status(200).json(
      new ApiResponse(200, {}, "Stock Purchased Successfully")
    );
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
});

const getAllUserStocks = asyncHandler(async (req, res) => {
  const userid = req.user.id;

  const [rows] = await pool.query(
    `SELECT 
        p.portfolio_id,
        p.stock_id,
        p.quantity,
        p.avg_buy_price,
        s.stock_name
     FROM portfolios p
     JOIN stock s ON p.stock_id = s.stock_id
     WHERE p.user_id = ?`,
    [userid]
  );

  if (rows.length === 0)
    throw new ApiError(404, "No Stock Purchased Yet");

  res.status(200).json(
    new ApiResponse(200, rows, "All Stock Fetched")
  );
});

const getAllTransactionHistory = asyncHandler(async (req, res) => {
  const userid = req.user.id;
  if (!userid) throw new ApiError(400, "Unauthorised Request");

  const [rows] = await pool.query(
    `SELECT 
       t.trade_id,
       t.user_id,
       t.stock_id,
       t.trade_type,
       t.quantity,
       t.price,
       t.total_amount,
       t.created_at,
       s.stock_name
     FROM Trades t
     JOIN stock s ON t.stock_id = s.stock_id
     WHERE t.user_id = ?
     ORDER BY t.created_at DESC`,
    [userid]
  );

  if (rows.length === 0) throw new ApiError(404, "No Transaction Yet");

  return res.status(200).json(
    new ApiResponse(200, { rows }, "All Transaction History Fetched")
  );
});

const sellStock = asyncHandler(async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const userid = req.user.id;
    if (!userid) throw new ApiError(401, "Unauthorised Request");

    const { name, quantity } = req.body;
    if (!name || !quantity || quantity <= 0)
      throw new ApiError(400, "Please provide a valid stock name and quantity");

    // Fetch the stock and user's portfolio in a single JOIN query
    const [rows] = await conn.query(`
      SELECT p.portfolio_id, p.quantity AS portfolio_quantity, p.avg_buy_price, s.stock_id, s.price AS current_price
      FROM portfolios p
      JOIN stock s ON p.stock_id = s.stock_id
      WHERE p.user_id = ? AND s.stock_name = ? FOR UPDATE
    `, [userid, name]);

    if (rows.length === 0) throw new ApiError(400, "You do not own this stock");

    const portfolio = rows[0];

    if (portfolio.portfolio_quantity < quantity)
      throw new ApiError(400, "Not enough stocks to sell");

    const remainingQty = portfolio.portfolio_quantity - quantity;
    const totalSellPrice = portfolio.current_price * quantity;

    // Update or delete portfolio
    if (remainingQty === 0) {
      await conn.query(
        "DELETE FROM portfolios WHERE portfolio_id = ?",
        [portfolio.portfolio_id]
      );
    } else {
      await conn.query(
        "UPDATE portfolios SET quantity=? WHERE portfolio_id=?",
        [remainingQty, portfolio.portfolio_id]
      );
    }

    // Update wallet balance
    const [walletRows] = await conn.query("SELECT * FROM wallet WHERE user_id=? FOR UPDATE", [userid]);
    if (walletRows.length === 0) throw new ApiError(404, "No wallet found");

    const newBalance = Number(walletRows[0].balance) + totalSellPrice;
    await conn.query("UPDATE wallet SET balance=? WHERE user_id=?", [newBalance, userid]);

    // Insert into Trades
    await conn.query(
      "INSERT INTO Trades (user_id, stock_id, trade_type, quantity, price, total_amount, stock_name) VALUES (?, ?, 'SELL', ?, ?, ?, ?)",
      [userid, portfolio.stock_id, quantity, portfolio.current_price, totalSellPrice, name]
    );

    await conn.commit();

    res.status(200).json(
      new ApiResponse(200, {}, `Sold ${quantity} shares of ${name} successfully`)
    );

  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
});
const getBoard=asyncHandler(async(req,res)=>{
  const leaderboard=await getLeaderBoard()
  res.status(200).json(
    new ApiResponse(201,{leaderboard},"LeaderBoard Fetched SuccesFully")
  )
})
const getWallet = asyncHandler(async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new ApiError(401, "Unauthorized request");
  }

  const [rows] = await pool.query(
    "SELECT wallet_id, balance, updated_at FROM wallet WHERE user_id = ?",
    [userId]
  );

  if (rows.length === 0) {
    throw new ApiError(404, "Wallet not found");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      rows[0],
      "Wallet fetched successfully"
    )
  );
});

//more required functions like logout, refresh token etc.
export {registerUser,loginUser,logoutUser,refreshAccessToken,buystock,getAllUserStocks,getAllTransactionHistory,sellStock,getBoard,deleteUser,getWallet}