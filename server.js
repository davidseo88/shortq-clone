const express = require("express");
const mongoose = require("mongoose");
const ShortURL = require("./models/ShortURL");
const { nanoid } = require("nanoid");
const path = require("path");
const app = express();

mongoose.connect("process.env.MONGO_URI", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));

app.set("view engine", "ejs");

app.get("/", async (req, res) => {
  const shortURLs = await ShortURL.find();
  res.render("index", { shortURLs });
});

app.post("/shorten", async (req, res) => {
  const fullUrl = req.body.fullUrl;
  const existing = await ShortURL.findOne({ full: fullUrl });
  if (existing) return res.redirect("/");

  const short = nanoid(6);
  await ShortURL.create({ full: fullUrl, short });
  res.redirect("/");
});

app.get("/:short", async (req, res) => {
  const shortUrl = await ShortURL.findOne({ short: req.params.short });
  if (!shortUrl) return res.status(404).send("Not found");

  shortUrl.clicks++;
  await shortUrl.save();
  res.redirect(shortUrl.full);
});

app.listen(3000, () => console.log("Server started on http://localhost:3000"));
