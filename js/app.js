// Load all products
if (document.getElementById("product-list")) {
  fetch("/api/products")
    .then(res => res.json())
    .then(data => {
      const list = document.getElementById("product-list");
      list.innerHTML = data.map(p => `
        <div class="product">
          <h3>${p.name}</h3>
          <p>${p.description}</p>
          <p>Rs ${p.price}</p>
          <p>Seller: ${p.seller}</p>
          <small>ID: ${p.id}</small>
        </div>
      `).join("");
    });
}

// Seller form
const sellerForm = document.getElementById("sellerForm");
if (sellerForm) {
  sellerForm.addEventListener("submit", e => {
    e.preventDefault();
    const name = document.getElementById("name").value;
    const price = Number(document.getElementById("price").value);
    const description = document.getElementById("description").value;
    const seller = document.getElementById("seller").value;
    fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, price, description, seller })
    })
      .then(res => res.json())
      .then(data => document.getElementById("message").textContent = data.message);
  });
}

// Order form
const orderForm = document.getElementById("orderForm");
if (orderForm) {
  orderForm.addEventListener("submit", e => {
    e.preventDefault();
    const productId = Number(document.getElementById("productId").value);
    const buyerName = document.getElementById("buyerName").value;
    const address = document.getElementById("address").value;
    const paymentMethod = document.getElementById("paymentMethod").value;

    fetch("/api/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, buyerName, address, paymentMethod })
    })
      .then(res => res.json())
      .then(data => {
        document.getElementById("orderMessage").textContent = data.message;
      });
  });
}

// Admin view
function loadOrders() {
  fetch("/api/orders")
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById("orders");
      container.innerHTML = data.map(o => `
        <div class="product">
          <h3>Order #${o.id}</h3>
          <p>Product ID: ${o.productId}</p>
          <p>Buyer: ${o.buyerName}</p>
          <p>Status: ${o.status}</p>
          <p>Commission: Rs ${o.commission}</p>
          <p>Seller Amount: Rs ${o.sellerAmount}</p>
        </div>
      `).join("");
    });
}
