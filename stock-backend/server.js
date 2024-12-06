const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());

let stockData = [
  { symbol: "TCS", price: 150.25, change: 1.5 },
  { symbol: "HDFC", price: 2800.55, change: -12.3 },
  { symbol: "RIL", price: 330.75, change: 3.2 },
];

// API endpoint to get the stock data
app.get("/api/stocks", (req, res) => {
  res.json(stockData);
});

// Real-time stock price update using Socket.IO
io.on("connection", (socket) => {
  console.log("Client connected");

  // Simulate price fluctuations every 2 seconds
  setInterval(() => {
    stockData = stockData.map((stock) => {
      // Randomly update the price between -0.5% and +0.5%
      const fluctuation = Math.random() * 1 - 0.5; // Random fluctuation from -0.5 to 0.5
      const newPrice = (stock.price * (1 + fluctuation / 100)).toFixed(2);
      const newChange = (newPrice - stock.price).toFixed(2);

      return {
        ...stock,
        price: parseFloat(newPrice),
        change: parseFloat(newChange),
      };
    });

    // Emit the updated stock data to all connected clients
    io.emit("stockUpdate", stockData);
  }, 2000); // Update every 2 seconds

  // Handle socket disconnection
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// Start the server
server.listen(5000, () => {
  console.log("Server is running on http://localhost:5000");
});
