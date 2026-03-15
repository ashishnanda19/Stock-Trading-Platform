<h1 align="center" style="font-weight: bold;">Stock Trading Backend API 📈</h1>

<p align="center">
 <a href="#tech">Technologies</a> • 
 <a href="#started">Getting Started</a> •
 <a href="#routes">API Endpoints</a> •
 <a href="#features">Features</a> •
 <a href="#contribute">Contribute</a>
</p>

<p align="center">
    <b>A secure and scalable backend for stock trading simulation with authentication, portfolio management, and transaction tracking.</b>
</p>

<h2 id="tech">💻 Technologies</h2>

- Node.js
- Express.js
- MySQL
- JWT Authentication (Access & Refresh Tokens)
- Rate Limiting
- Password Hashing (bcrypt)
- BullMQ (Queue Support – optional)
- dotenv
- MVC Architecture

---

<h2 id="started">🚀 Getting Started</h2>

Follow the steps below to run the project locally.

<h3>Prerequisites</h3>

Make sure you have:

- [Node.js](https://nodejs.org/) (v16+)
- [MySQL](https://www.mysql.com/) (local or cloud)
- [Git](https://git-scm.com/)
- npm or yarn

---

<h3>Cloning the Repository</h3>

```bash
git clone https://github.com/your-username/stockprojectbackend.git
cd stockprojectbackend
```

<h3>Environment Variables</h3>

Create a `.env` file in the root directory:

```env
PORT=5000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=stockdb

ACCESS_TOKEN_SECRET=your_access_secret
REFRESH_TOKEN_SECRET=your_refresh_secret
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

NODE_ENV=development
```

<h3>Install & Run</h3>

```bash
npm install
npm run dev
```

Production:

```bash
npm start
```

Server runs on:

```
http://localhost:5000
```

---

<h2 id="features">✨ Features</h2>

- 🔐 User Registration & Login
- 🔁 JWT-based Access & Refresh Token flow
- 🧾 Buy & Sell Stocks
- 📊 User Portfolio Management
- 📜 Transaction History
- 🧠 Stock Board (Market View)
- 🛡️ API Rate Limiting
- ⚙️ Centralized Error Handling
- 🧵 Async Handler Pattern
- 🧩 Modular MVC Structure

---

<h2 id="routes">📍 API Endpoints</h2>

<h3>Authentication</h3>

| Route | Description |
|-------|-------------|
| <kbd>POST /api/users/register</kbd> | Register new user |
| <kbd>POST /api/users/login</kbd> | Login user |
| <kbd>POST /api/users/logout</kbd> | Logout user |
| <kbd>POST /api/users/refresh-token</kbd> | Refresh access token |

<h3>Stocks (Protected)</h3>

| Route | Description |
|-------|-------------|
| <kbd>POST /api/stocks/buy</kbd> | Buy stock |
| <kbd>POST /api/stocks/sell</kbd> | Sell stock |
| <kbd>GET /api/stocks/my-stocks</kbd> | Get user portfolio |
| <kbd>GET /api/stocks/transactions</kbd> | Transaction history |
| <kbd>GET /api/stocks/board</kbd> | Stock board |

🔐 **Requires:**
```
Authorization: Bearer {access_token}
```

---

<h3 id="post-register">POST /api/users/register</h3>

**REQUEST**
```json
{
  "username": "arman",
  "email": "arman@example.com",
  "password": "StrongPass123"
}
```

**RESPONSE**
```json
{
  "success": true,
  "message": "User registered successfully"
}
```

---

<h3 id="post-login">POST /api/users/login</h3>

**REQUEST**
```json
{
  "email": "arman@example.com",
  "password": "StrongPass123"
}
```

**RESPONSE**
```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

<h3 id="post-logout">POST /api/users/logout</h3>

**HEADERS**
```
Authorization: Bearer {access_token}
```

**RESPONSE**
```json
{
  "success": true,
  "message": "User logged out successfully"
}
```

---

<h3 id="post-refresh">POST /api/users/refresh-token</h3>

**REQUEST**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**RESPONSE**
```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

<h3 id="post-buy">POST /api/stocks/buy</h3>

**HEADERS**
```
Authorization: Bearer {access_token}
```

**REQUEST**
```json
{
  "symbol": "AAPL",
  "quantity": 5
}
```

**RESPONSE**
```json
{
  "success": true,
  "message": "Stock purchased successfully",
  "transaction": {
    "id": 1,
    "symbol": "AAPL",
    "quantity": 5,
    "price": 178.50,
    "total": 892.50,
    "type": "BUY",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

---

<h3 id="post-sell">POST /api/stocks/sell</h3>

**HEADERS**
```
Authorization: Bearer {access_token}
```

**REQUEST**
```json
{
  "symbol": "AAPL",
  "quantity": 2
}
```

**RESPONSE**
```json
{
  "success": true,
  "message": "Stock sold successfully",
  "transaction": {
    "id": 2,
    "symbol": "AAPL",
    "quantity": 2,
    "price": 180.00,
    "total": 360.00,
    "type": "SELL",
    "timestamp": "2024-01-15T14:20:00Z"
  }
}
```

---

<h3 id="get-mystocks">GET /api/stocks/my-stocks</h3>

**HEADERS**
```
Authorization: Bearer {access_token}
```

**RESPONSE**
```json
{
  "success": true,
  "portfolio": [
    {
      "symbol": "AAPL",
      "quantity": 3,
      "averagePrice": 150.00,
      "currentPrice": 178.50,
      "totalValue": 535.50,
      "profit": 85.50,
      "profitPercent": 19.00
    },
    {
      "symbol": "GOOGL",
      "quantity": 5,
      "averagePrice": 140.00,
      "currentPrice": 145.20,
      "totalValue": 726.00,
      "profit": 26.00,
      "profitPercent": 3.71
    }
  ],
  "totalPortfolioValue": 1261.50,
  "totalProfit": 111.50
}
```

---

<h3 id="get-transactions">GET /api/stocks/transactions</h3>

**HEADERS**
```
Authorization: Bearer {access_token}
```

**QUERY PARAMETERS**
```
?limit=10&offset=0&type=BUY
```

**RESPONSE**
```json
{
  "success": true,
  "transactions": [
    {
      "id": 1,
      "symbol": "AAPL",
      "quantity": 5,
      "price": 178.50,
      "total": 892.50,
      "type": "BUY",
      "timestamp": "2024-01-15T10:30:00Z"
    },
    {
      "id": 2,
      "symbol": "AAPL",
      "quantity": 2,
      "price": 180.00,
      "total": 360.00,
      "type": "SELL",
      "timestamp": "2024-01-15T14:20:00Z"
    }
  ],
  "pagination": {
    "limit": 10,
    "offset": 0,
    "total": 2
  }
}
```

---

<h3 id="get-board">GET /api/stocks/board</h3>

**HEADERS**
```
Authorization: Bearer {access_token}
```

**RESPONSE**
```json
{
  "success": true,
  "stocks": [
    {
      "symbol": "AAPL",
      "name": "Apple Inc.",
      "price": 178.50,
      "change": 2.35,
      "changePercent": 1.33,
      "volume": 52847392,
      "high": 179.20,
      "low": 176.80
    },
    {
      "symbol": "GOOGL",
      "name": "Alphabet Inc.",
      "price": 145.20,
      "change": -0.80,
      "changePercent": -0.55,
      "volume": 31245678,
      "high": 146.50,
      "low": 144.80
    },
    {
      "symbol": "MSFT",
      "name": "Microsoft Corporation",
      "price": 390.50,
      "change": 5.20,
      "changePercent": 1.35,
      "volume": 28934567,
      "high": 391.00,
      "low": 387.30
    }
  ]
}
```

---

<h2 id="contribute">📫 Contribute</h2>

Contributions are welcome! 🚀 Here's how you can help:

1. **Fork the repository**

2. **Create a feature branch**
```bash
git checkout -b feature/your-feature
```

3. **Commit your changes** (follow commit conventions)
```bash
git commit -m "feat: add new feature"
```

4. **Push to your branch**
```bash
git push origin feature/your-feature
```

5. **Open a Pull Request** with a detailed description

<h3>Commit Conventions</h3>

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

<h3>Helpful Resources</h3>

[📝 How to create a Pull Request](https://www.atlassian.com/git/tutorials/making-a-pull-request)

[💾 Commit Conventions](https://gist.github.com/joshbuchea/6f47e86d2510bce28f8e7f42ae84c716)

[📚 Express.js Documentation](https://expressjs.com/)

[🔐 JWT Documentation](https://jwt.io/)

[🗄️ MySQL Documentation](https://dev.mysql.com/doc/)
