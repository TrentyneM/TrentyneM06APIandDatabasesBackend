// Setup.. This is similar to when we use our default tags in html
const express = require("express");
// We have to use cors in order to host a front end and backend on the same device
const cors = require("cors");
// Activate or tell this app variable to be an express server
require("./db"); // ensure DB connects on startup
const Song = require("./models/song"); // <- make sure file is models/song.js

const app = express();

// allow your frontend URL in prod, any origin in dev
const allowed = process.env.FRONTEND_URL || "*";
app.use(cors({ origin: allowed }));

app.use(express.json());

const router = express.Router();

// ADD THESE TWO LINES HERE (root + health)
app.get("/", (req, res) => res.send("API is running. Try /api/songs"));
app.get("/healthz", (req, res) => res.send("ok"));

// Grab all the songs in the database
router.get("/songs", async function (req, res) {
  try {
    // use req.query, not res.query
    const { genre } = req.query || {};
    const query = genre ? { genre } : {};
    const songs = await Song.find(query).exec();
    res.json(songs);
  } catch (err) {
    res.status(400).send(err);
  }
});

// Grab a single song in the database
router.get("/songs/:id", async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    res.json(song);
  } catch (err) {
    res.status(400).send(err);
  }
});

// Add a song to the database
router.post("/songs", async (req, res) => {
  try {
    const song = await new Song(req.body);
    await song.save();
    res.status(201).json(song);
  } catch (err) {
    res.status(400).send(err);
  }
});

// Update is to update and existing record/resource/database entry... it uses a put request
router.put("/songs/:id", async (req, res) => {
  try {
    const song = req.body;
    delete song._id;

    await Song.updateOne({ _id: req.params.id }, song);

    console.log(song);
    res.sendStatus(204);
  } catch (err) {
    console.error(err.message);
    res.status(400).send(err.message);
  }
});

// Delete a song
router.delete("/songs/:id", async (req, res) => {
  try {
    await Song.deleteOne({ _id: req.params.id });
    res.sendStatus(204);
  } catch (err) {
    res.status(400).send(err);
  }
});

// All requests that usually use an api start with /api... so the url would be localhost:3000
app.use("/api", router);

// use Render's port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on :${PORT}`));

