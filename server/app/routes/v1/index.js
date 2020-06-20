"use strict";

const express = require("express");
const auth = require("./auth");

const app = express();

app.use("/auth", auth);
app.get("/status", (req, res) => res.send("OK"));

module.exports = app;
