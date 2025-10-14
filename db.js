// db.js
const mongoose = require("mongoose");

// Allow .env in local dev; Render just ignores this line.
try { require("dotenv").config(); } catch {}

// 1) Read the connection string from the environment
const URI = ("mongodb+srv://songdbtrent:trentyne@songdb.lkgiwye.mongodb.net/?retryWrites=true&w=majority&appName=songdb")

// 2) Fail fast if it’s missing
if (!URI) {
  console.error("MONGODB_URI is not set. Add it to .env (local) or Render env vars.");
  process.exit(1);
}

// 3) Connect (Mongoose v8+ needs no extra options)
mongoose
  .connect(URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error(" MongoDB connection error:", err.message);
    process.exit(1);
  });

module.exports = mongoose;

