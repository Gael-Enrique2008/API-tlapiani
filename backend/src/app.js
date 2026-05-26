const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const dataRoutes = require("./routes/data.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api", (req, res) => {
    res.json({
        mensaje: "Tlapiani backend activo"
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/data", dataRoutes);
module.exports = app;