require('dotenv').config();

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors'); 

// Middleware
app.use(cors());
app.use(express.json());

// ESQUEMA Y MODELO
const MeasurementSchema = new mongoose.Schema({
    device_id: {
        type: String,
        required: true
    },
    flow: {
        type: Number,
        required: true
    },
    tds: {
        type: Number,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const Measurement = mongoose.model('Measurement', MeasurementSchema);

// RUTAS

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('API funcionando');
});

// GET (dashboard)
app.get('/api/data', async (req, res) => {
    try {
        const data = await Measurement.find()
            .sort({ timestamp: -1 })
            .limit(10);

        res.json(data);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST (ESP32 / celular)
app.post('/api/data', async (req, res) => {
    try {
        const { device_id, flow, tds } = req.body;

        if (!device_id || flow === undefined || tds === undefined) {
            return res.status(400).json({
                message: "Faltan datos requeridos"
            });
        }

        console.log("📥 Datos recibidos:", req.body); // debug útil

        const newMeasurement = new Measurement({
            device_id,
            flow,
            tds
        });

        await newMeasurement.save();

        res.status(200).json({
            message: "Datos guardados correctamente"
        });

    } catch (error) {
        console.error("ERROR:", error);

        res.status(500).json({
            message: error.message
        });
    }
});

// CONEXION A MONGODB + SERVER

const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log("Conectado a MongoDB");

    app.listen(PORT, () => {
        console.log(`Servidor corriendo en puerto ${PORT}`);
    });

})
.catch(err => {
    console.error("Error conectando a MongoDB:", err);
});
