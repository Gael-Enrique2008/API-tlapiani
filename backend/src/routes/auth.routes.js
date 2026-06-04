const authMiddleware = require("../middleware/auth.middleware");
const { register, login, addDevice, getDevices } = require("../controllers/auth.controller");

const express = require("express");
const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.get("/me", authMiddleware, (req, res) => {
    res.status(200).json({
        mensaje: "Acceso autorizado",
        user: req.user
    });
});

router.post("/devices", authMiddleware, addDevice);
router.get("/devices", authMiddleware, getDevices);

module.exports = router;