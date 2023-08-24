const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

const { client_id, client_secret, redirect_uri, refresh_token_env } = process.env;

const {
  callback,
  girisURL,
  rastgeleMetin,
  tokenYenile,
} = require("./spotify-api/tokenIsle");

const apiRouter = require("./routers/api");

app.use(express.static(__dirname + "/public")).use(cors());

const tokenYenileyici = async (req, res, next) => {
  // const { refresh_token } = req.query;
  const refresh_token = refresh_token_env;

  if (!refresh_token) return next();

  const yeniToken = await tokenYenile({ refresh_token });

  if (yeniToken.error) return next();

  req.query.access_token = yeniToken;

  next();
};

app.use("/api", tokenYenileyici, apiRouter);

app.get("/giris", function (req, res) {
  const metin = rastgeleMetin(16);

  res.cookie("spotify_auth_state", metin);

  const url = girisURL({ rastgeleMetin: metin });

  res.redirect(url);
});

app.get("/callback", callback);

app.get("/refresh_token", async (req, res) => {
  const token = await tokenYenile({
    refresh_token: req.query.refresh_token,
  });

  res.send(token);
});

app.listen(80, () => console.log("80 Portu Dinleniyor."));
