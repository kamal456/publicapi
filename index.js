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
    <form id="scanForm" action="/security/scan" method="POST">
    <input type="hidden" name="loc" value="${loc}">
    <input type="hidden" name="lat" id="lat">
    <input type="hidden" name="lng" id="lng">

    <button type="button" onclick="sendLocation()">Submit</button>
</form>

<script>
function sendLocation() {

    if (!navigator.geolocation) {
        alert("Geolocation is not supported.");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        function(pos) {

            document.getElementById("lat").value = pos.coords.latitude;
            document.getElementById("lng").value = pos.coords.longitude;

            document.getElementById("scanForm").submit();
        },

        function(err) {
            alert("Location permission denied.");
            console.log(err);
        },

        {
            enableHighAccuracy: true,
            timeout: 10000
        }
    );
}
</script>
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
