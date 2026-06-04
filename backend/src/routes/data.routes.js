const express = require("express");
const router = express.Router();

const {
    saveMeasurement,
    getMeasurements
} = require("../controllers/data.controller");

router.post("/", saveMeasurement);
router.get("/", getMeasurements);

module.exports = router;