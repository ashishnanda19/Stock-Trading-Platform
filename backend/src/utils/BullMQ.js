import {Queue,Worker} from "bullmq";
import { pool } from "../db/index.js";
import IORedis, { Redis } from "ioredis";
const connection=new IORedis({maxRetriesPerRequest:null});
const stockQueue=new Queue("stock-price-simulation",{connection})
const stimulateStockPrices=async()=>{
    const [stocks]=await pool.query("Select * From stock");
    for(const stock of stocks){
        const changePercent=(Math.random()*50-25)/100;
        const newPrice=+(stock.price*(1+changePercent)).toFixed(2)
        await pool.query("update stock set last_price=?,price=? where stock_id=?",[stock.price,newPrice,stock.stock_id])
        await pool.query("insert into stockhistory (stock_name,price) Values(?,?)",[stock.stock_name,newPrice]);
    }
    console.log("Stock price simulation finished!");
}
const updateLeaderboard=async()=>{
    const redis=connection;
    const pipeline=redis.pipeline();
    const [rows] = await pool.query(`
    SELECT 
  u.id AS user_id,
  COALESCE(w.balance, 0) +
  COALESCE(SUM(p.quantity * s.price), 0) AS total_value
  FROM Users u
  LEFT JOIN wallet w ON u.id = w.user_id
  LEFT JOIN portfolios p ON u.id = p.user_id
  LEFT JOIN stock s ON p.stock_id = s.stock_id
GROUP BY u.id

  `);
  pipeline.del("leaderboard")
  for(const user of rows){
    pipeline.zadd("leaderboard",Number(user.total_value),String(user.user_id))
  }
  await pipeline.exec()
}
const getLeaderBoard=async()=>{
    const redis=connection;
    const top=await redis.zrevrange("leaderboard",0,9,"WITHSCORES")
    const userIds=[]
    const scoreMap={}
    for (let i = 0; i < top.length; i += 2) {
    const userId = Number(top[i]);
    const totalValue = parseFloat(top[i + 1]);
    userIds.push(userId);
    scoreMap[userId]=totalValue
    }
    const [users] = await pool.query(
    `SELECT id, username FROM Users WHERE id IN (?)`,
    [userIds]
    );
    const result=users.map(user=>({
      user_id:user.id,
      username:user.username,
      total_value:scoreMap[user.id]
    }))
    result.sort(
    (a, b) => b.total_value - a.total_value
    );
  return result;
}
new Worker("stock-price-simulation",async job=>{
    await stimulateStockPrices()
    await updateLeaderboard()
},{connection})

const scheduleStockSimulation=async()=>{
    await stockQueue.add("stock-price-simulation",{},{
        repeat:{every:30*60*1000},
        removeOnComplete:true,
        removeOnFail:true
    })
}
export {scheduleStockSimulation,getLeaderBoard}
