const express = require("express");
const router = express.Router();

const {
    saveMeasurement
} = require("../controllers/data.controller");

router.post("/", saveMeasurement);

module.exports = router;