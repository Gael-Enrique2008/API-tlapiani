require('dotenv').config();

const express = require('express');
const app = express();
const mongoose = require('mongoose');

// Conexion segura usando variables de entorno
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("Conectado a MongoDB"))
.catch(err => console.log(err));

// Esquema
const MeasurementSchema = new mongoose.Schema({
    device_id: String,
    flow: Number,
    tds: Number,
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const Measurement = mongoose.model('Measurement', MeasurementSchema);

app.use(express.json());

// ruta de prueba
app.get('/', (req, res) => {
    res.send('API funcionando');
});

// Endpoint principal
app.post('/api/data', async (req, res) => {
    try {
        const data = req.body;

        const newMeasurement = new Measurement(data);
        await newMeasurement.save();

        res.status(200).json({
            message: "Datos guardados correctamente"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error al guardar datos"
        });
    }
});

// Puerto dinamico
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});