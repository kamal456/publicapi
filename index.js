const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

const API_KEY = "CAB123";

let queue = [];

// ===============================
// 🔧 Middleware
// ===============================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===============================
// 🔐 Security (UPDATED)
// ===============================
app.use((req, res, next) => {

  // ✅ Allow public routes (QR + form submit)
  if (
    req.path.startsWith("/cabScan") ||
    (req.path === "/cab/location" && req.method === "POST")
  ) {
    return next();
  }

  // 🔐 Protect other APIs
  if (req.headers["x-api-key"] !== API_KEY) {
    return res.status(403).send("Unauthorized");
  }

  next();
});

// ===============================
// 🧪 Health
// ===============================
app.get("/health", (req, res) => res.send("OK"));

// ===============================
// 🚖 QR UI (PUBLIC)
// ===============================
app.get("/cabScan", (req, res) => {
  const { cabId } = req.query;

  if (!cabId) {
    return res.send("Invalid QR");
  }

  res.send(`
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1">
    </head>

    <body style="font-family: Arial; padding:20px">

      <h2>🚖 Cab ID: ${cabId}</h2>

      <form action="/cab/location" method="POST">

        <input type="hidden" name="cabId" value="${cabId}" />
        <input type="hidden" name="lat" id="lat" />
        <input type="hidden" name="lng" id="lng" />

        <label><b>Select Shift:</b></label><br>
        <select name="shift">
          <option>GENERAL</option>
          <option>FIRST</option>
          <option>SECOND</option>
        </select>

        <br><br>

        <label><b>Scan Type:</b></label><br>
        <select name="scanType">
          <option>BOARDING</option>
          <option>REACHING</option>
          <option>DROPPING</option>
        </select>

        <br><br>

        <button type="submit">Submit</button>
      </form>

      <script>
        navigator.geolocation.getCurrentPosition(function(pos){
          document.getElementById("lat").value = pos.coords.latitude;
          document.getElementById("lng").value = pos.coords.longitude;
        });
      </script>

    </body>
    </html>
  `);
});

// ===============================
// 📥 POST (Driver → API)
// ===============================
app.post("/cab/location", (req, res) => {

  const cabId = req.body.cabId;
  const lat = req.body.lat;
  const lng = req.body.lng;
  const shift = req.body.shift;
  const scanType = req.body.scanType;

  if (!cabId || !lat || !lng) {
    return res.status(400).send("Missing fields");
  }

  const record = {
    cabId,
    lat,
    lng,
    shift,
    scanType,
    time: new Date()
  };

  queue.push(record);

  console.log("📥 Received:", record);

  res.send(`
    <h3>✅ Submitted Successfully</h3>
    <p>Cab ID: ${cabId}</p>
    <p>Lat: ${lat}</p>
    <p>Lng: ${lng}</p>
  `);
});

// ===============================
// 📤 GET (Local → API)
// ===============================
app.get("/cab/location", (req, res) => {
  const data = [...queue];
  queue = [];

  console.log("📤 Sent:", data.length);

  res.json(data);
});

// ===============================
app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});
