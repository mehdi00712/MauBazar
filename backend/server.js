const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "..")));

const dataFile = path.join(__dirname, "data.json");

// Read & write functions
function readData() {
  if (!fs.existsSync(dataFile)) return { products: [], orders: [] };
  return JSON.parse(fs.readFileSync(dataFile));
}
function writeData(data) {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
}

// ROUTES
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "../index.html")));

app.get("/api/products", (req, res) => res.json(readData().products));

app.post("/api/products", (req, res) => {
  const { name, price, description, seller } = req.body;
  const data = readData();
  const product = { id: Date.now(), name, price, description, seller };
  data.products.push(product);
  writeData(data);
  res.json({ message: "Product added!", product });
});

app.post("/api/order", (req, res) => {
  const { productId, buyerName, address, paymentMethod } = req.body;
  const data = readData();
  const product = data.products.find((p) => p.id === productId);
  if (!product) return res.status(404).json({ message: "Product not found" });

  const commission = product.price * 0.02;
  const sellerAmount = product.price - commission;

  const order = {
    id: Date.now(),
    productId,
    buyerName,
    address,
    paymentMethod,
    total: product.price,
    commission,
    sellerAmount,
    status: "Pending Delivery",
  };

  data.orders.push(order);
  writeData(data);
  res.json({ message: "Order placed! Pay via Juice to confirm.", order });
});

app.get("/api/orders", (req, res) => res.json(readData().orders));

app.post("/api/orders/deliver", (req, res) => {
  const { orderId } = req.body;
  const data = readData();
  const order = data.orders.find((o) => o.id === orderId);
  if (!order) return res.status(404).json({ message: "Order not found" });
  order.status = "Delivered";
  writeData(data);
  res.json({ message: "Order marked delivered.", order });
});

app.listen(PORT, () => console.log(`🚀 MauBazar running on http://localhost:${PORT}`));
