"use strict";

const express = require("express");
const { authCtrl } = require("../../controllers");

const router = express.Router();

router.get("/login", authCtrl.login);
router.post("/token", authCtrl.renewToken);
router.post("/verify", authCtrl.renewToken);

module.exports = router;
