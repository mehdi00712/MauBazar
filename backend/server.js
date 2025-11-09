// ===== MauBazar Backend (Node.js + Express) =====

// Import dependencies
const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");

// Initialize app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Allow requests from your GitHub Pages frontend
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, ".."))); // Serve frontend files if needed

// Data file (acts as a local database)
const dataFile = path.join(__dirname, "data.json");

// Helper functions
function readData() {
  if (!fs.existsSync(dataFile)) {
    return { products: [], orders: [] };
  }
  const raw = fs.readFileSync(dataFile);
  return JSON.parse(raw);
}

function writeData(data) {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
}

// ===== ROUTES =====

// ✅ Home route (optional test)
app.get("/", (req, res) => {
  res.send("✅ MauBazar Backend is Live!");
});

// ✅ Get all products
app.get("/api/products", (req, res) => {
  const data = readData();
  res.json(data.products);
});

// ✅ Add a new product (for sellers)
app.post("/api/products", (req, res) => {
  const { name, price, description, seller } = req.body;
  if (!name || !price || !seller) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const data = readData();
  const newProduct = {
    id: Date.now(),
    name,
    price: Number(price),
    description,
    seller,
  };

  data.products.push(newProduct);
  writeData(data);

  console.log(`🛒 New product added: ${name} by ${seller}`);
  res.json({ message: "Product added successfully!", product: newProduct });
});

// ✅ Create new order (for buyers)
app.post("/api/order", (req, res) => {
  const { productId, buyerName, address, paymentMethod } = req.body;
  const data = readData();

  const product = data.products.find((p) => p.id === productId);
  if (!product) return res.status(404).json({ message: "Product not found" });

  const commission = Math.round(product.price * 0.02);
  const sellerAmount = product.price - commission;

  const newOrder = {
    id: Date.now(),
    productId,
    buyerName,
    address,
    paymentMethod,
    total: product.price,
    commission,
    sellerAmount,
    status: "Pending Delivery",
    date: new Date().toISOString(),
  };

  data.orders.push(newOrder);
  writeData(data);

  console.log(`💸 New order placed by ${buyerName}. Commission: Rs ${commission}`);
  res.json({
    message: "Order placed successfully! Please send payment via Juice to confirm.",
    order: newOrder,
  });
});

// ✅ Get all orders (Admin)
app.get("/api/orders", (req, res) => {
  const data = readData();
  res.json(data.orders);
});

// ✅ Mark order as delivered (Admin)
app.post("/api/orders/deliver", (req, res) => {
  const { orderId } = req.body;
  const data = readData();

  const order = data.orders.find((o) => o.id === orderId);
  if (!order) return res.status(404).json({ message: "Order not found" });

  order.status = "Delivered";
  writeData(data);

  console.log(`🚚 Order ${orderId} marked as delivered.`);
  res.json({ message: "Order marked as delivered", order });
});

// ===== Start Server =====
app.listen(PORT, () => {
  console.log(`🚀 MauBazar Backend running on port ${PORT}`);
});
