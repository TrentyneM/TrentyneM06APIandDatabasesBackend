// Setup.. This is similar to when we use our default tags in html
const express = require("express");

// Using cors to tie front and back end together
const cors = require("cors");

//const bodyParser = require('body-parser')
const jwt = require("jwt-simple");
const bcrypt = require("bcryptjs");
const secret = process.env.JWT_SECRET || "supersecret";
const User = require("./models/users");

// Variable needs to be an express server.
require("./db");                       =
const Song = require("./models/song"); // models/song.js
const app = express();

// Frontend URL in production, but any origin in dev
const allowed = process.env.FRONTEND_URL || "*";
app.use(cors({ origin: allowed }));
app.use(express.json());
const router = express.Router();

//Creating a new user
router.post("/user", async (req, res) => {
  if (!req.body.username || !req.body.password) {
    return res.status(400).json({ error: "Missing username or password" });
  }

  const newUser = new User({
    username: req.body.username,
    password: req.body.password,
    status: req.body.status,
  });

  try {
    await newUser.save();
    console.log(newUser);
    return res.sendStatus(201);
  } catch (err) {
    return res.status(400).send(err);
  }
});

// Authenticate=
router.post("/auth", async (req, res) => {
  if (!req.body.username || !req.body.password) {
    return res.status(400).json({ error: "Missing username or password" });
  }

  try {

    //Find the username in the database
    let user = await User.findOne({ username: req.body.username });

    if (!user) {
      return res.status(401).json({ error: "Bad Username" });
    } else if (user.password !== req.body.password) {
      return res.status(401).json({ error: "Bad Password" });
    } else {
      // On successful login, create token and respond
      const username2 = user.username;
      const token = jwt.encode({ username: user.username }, secret);
      const auth = 1;

      return res.status(200).json({
        username2,
        token,
        auth,
      });
    }
  } catch (err) {
    return res.status(500).send(err);
  }
});

// Check status of user with a valid token
router.get("/status", async (req, res) => {
  if (!req.headers["x-auth"]) {
    return res.status(401).json({ error: "Missing X-Auth" });
  }

  // if x-auth contains the token (it should)
  const token = req.headers["x-auth"];
  try {
    const decoded = jwt.decode(token, secret);

    let users = await User.find({}, "username status");
    return res.json(users);
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
});

// --- SONG ROUTES ---
router.get("/songs", async (req, res) => {
  try {
    const songs = await Song.find({});
    res.json(songs);
  } catch (err) {
    res.status(500).send(err);
  }
});

router.post("/songs", async (req, res) => {
   console.log("POST /songs body:", req.body); // should show username
  try {
    // grab username from the token
    const token = req.headers["x-auth"];
    if (!token) return res.status(401).json({ error: "Missing X-Auth" });

    const { username } = jwt.decode(token, secret);
    req.body.username = username;

    const song = new Song(req.body);
    await song.save();
    res.status(201).json(song);
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

// use Render's port or 3000 locally
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => console.log(`Server running on :${PORT}`));
