const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

const API_KEY = "CAB123";

let queue = [];

app.use(cors());
app.use(express.json());

// 🔐 Security
app.use((req, res, next) => {
  if (req.headers["x-api-key"] !== API_KEY) {
    return res.status(403).send("Unauthorized");
  }
  next();
});

// Health
app.get("/health", (req, res) => res.send("OK"));

// POST (Driver)
app.post("/cab/location", (req, res) => {
  const { cabId, lat, lng } = req.body;

  if (!cabId || !lat || !lng) {
    return res.status(400).send("Missing fields");
  }

  queue.push({
    cabId,
    lat,
    lng,
    time: new Date()
  });

  res.send({ message: "Saved" });
});

// GET (Local)
app.get("/cab/location", (req, res) => {
  const data = [...queue];
  queue = [];
  res.json(data);
});

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});