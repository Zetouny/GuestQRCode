const express = require("express");
const QRCode = require("qrcode");
const db = require("./db");

const app = express();
const PORT = 3000;
const MAX_VISITS = 25;
const CODE_LENGTH = 6;
const CODE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const CODE_REGEX = /^[A-Z0-9]{6}$/;

app.use(express.static("client"));
app.use(express.json());

function generateCode() {
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return code;
}

function getUniqueCode() {
  for (let i = 0; i < 20; i++) {
    const code = generateCode();
    if (!db.getVisitor(code)) return code;
  }
  throw new Error("Could not generate a unique code");
}

function parseCode(text) {
  const cleaned = (text || "").trim().toUpperCase();
  return CODE_REGEX.test(cleaned) ? cleaned : null;
}

app.get("/api/qr", async (req, res) => {
  const visitorId = parseCode(req.query.vid) || getUniqueCode();

  try {
    const qr = await QRCode.toDataURL(visitorId, {
      errorCorrectionLevel: "M",
      width: 400,
      margin: 2,
    });
    db.insertVisitor(visitorId, qr);
    res.json({ visitorId, qr });
  } catch {
    res.status(500).json({ error: "Failed to generate QR code" });
  }
});

app.get("/api/visitors", (req, res) => {
  res.json(db.getAllVisitors());
});

app.get("/validate", (req, res) => {
  res.sendFile("validate.html", { root: "client" });
});

app.post("/api/visitors/register-visit", (req, res) => {
  const visitorId = parseCode(req.body?.scanText);
  if (!visitorId) return res.status(400).json({ error: "Invalid QR content" });

  const visitor = db.getVisitor(visitorId);
  if (!visitor) return res.status(404).json({ error: "Visitor not found" });

  if (visitor.visited_at) {
    return res.json({
      visitorId: visitor.uuid,
      visitedAt: visitor.visited_at,
      alreadyVisited: true,
      visitedCount: db.getVisitedCount(),
      maxVisits: MAX_VISITS,
    });
  }

  const visitedCount = db.getVisitedCount();
  if (visitedCount >= MAX_VISITS) {
    return res.status(403).json({
      error: `Visit limit reached (${MAX_VISITS})`,
      visitedCount,
      maxVisits: MAX_VISITS,
    });
  }

  db.markVisited(visitorId);
  const updated = db.getVisitor(visitorId);

  res.json({
    visitorId: updated.uuid,
    visitedAt: updated.visited_at,
    alreadyVisited: false,
    visitedCount: visitedCount + 1,
    maxVisits: MAX_VISITS,
  });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
