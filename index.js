const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

let queue = [];

// ===============================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===============================
// 📲 QR PAGE
// ===============================
app.get("/scan", (req, res) => {
  const { loc } = req.query;

  if (!loc) return res.send("Invalid QR");

  res.send(`
    <html>
    <body style="font-family: Arial; padding:20px">

      <h2>🔐 Location: ${loc}</h2>

      <form action="/security/scan" method="POST">
        <input type="hidden" name="loc" value="${loc}" />
        <input type="hidden" name="lat" id="lat" />
        <input type="hidden" name="lng" id="lng" />

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
// 📥 STORE TEMP DATA
// ===============================
app.post("/security/scan", (req, res) => {

  const { loc, lat, lng } = req.body;

  if (!loc || !lat || !lng) {
    return res.status(400).send("Missing data");
  }

  const record = {
    loc,
    scannedLat: lat,
    scannedLng: lng,
    time: new Date()
  };

  queue.push(record);

  console.log("📥 Scan stored:", record);

  res.send(`<h3>✅ Scan Submitted</h3>`);
});

// ===============================
// 📤 LOCAL SERVER WILL FETCH
// ===============================
app.get("/security/pull", (req, res) => {
  const data = [...queue];
  queue = []; // clear after fetch

  console.log("📤 Sent to local:", data.length);

  res.json(data);
});

// ===============================
app.listen(PORT, () => {
  console.log("🚀 Public API running on", PORT);
});
