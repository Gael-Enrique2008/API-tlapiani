require('dotenv').config();

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); 

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

// =======================
// ESQUEMA USERS
// =======================

const UserSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true
    },

    apellido: {
        type: String,
        required: true
    },

    correo: {
        type: String,
        required: true,
        unique: true
    },

    username: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },

    celular: {
        type: String
    },

    rol: {
        type: String,
        default: "user"
    }

}, {
    timestamps: true
});

const User = mongoose.model('User', UserSchema);

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

// =======================
// REGISTER
// =======================

app.post('/api/register', async (req, res) => {

    try {

        const {
            nombre,
            apellido,
            correo,
            username,
            password,
            celular
        } = req.body;

        // VALIDAR CAMPOS

        if (
            !nombre ||
            !apellido ||
            !correo ||
            !username ||
            !password
        ) {

            return res.status(400).json({
                message: "Faltan campos obligatorios"
            });
        }

        // VERIFICAR SI YA EXISTE

        const userExists = await User.findOne({
            $or: [
                { correo },
                { username }
            ]
        });

        if (userExists) {
            return res.status(400).json({
                message: "El usuario ya existe"
            });
        }

        // ENCRIPTAR PASSWORD

        const salt = await bcrypt.genSalt(10);

        const hashedPassword = await bcrypt.hash(password, salt);

        // CREAR USUARIO

        const newUser = new User({
            nombre,
            apellido,
            correo,
            username,
            password: hashedPassword,
            celular
        });

        await newUser.save();

        res.status(201).json({
            message: "Usuario registrado correctamente"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: error.message
        });
    }
});

// =======================
// LOGIN
// =======================

app.post('/api/login', async (req, res) => {

    try {

        const { username, password } = req.body;

        // BUSCAR USUARIO

        const user = await User.findOne({ username });

        if (!user) {
            return res.status(400).json({
                message: "Usuario no encontrado"
            });
        }

        // VALIDAR PASSWORD

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(400).json({
                message: "Contraseña incorrecta"
            });
        }

        // TOKEN

        const token = jwt.sign(
            {
                id: user._id,
                username: user.username,
                rol: user.rol
            },
            process.env.JWT_SECRET || "secretkey",
            {
                expiresIn: "7d"
            }
        );

        res.json({
            message: "Login exitoso",
            token,
            user: {
                id: user._id,
                nombre: user.nombre,
                apellido: user.apellido,
                correo: user.correo,
                username: user.username,
                rol: user.rol
            }
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: error.message
        });
    }
});

// CONEXION A MONGODB + SERVER

const PORT = process.env.PORT || 3000;

mongoose.set('strictQuery', true);

mongoose.connect(process.env.MONGO_URI)
.then(() => {

    console.log("Conectado a MongoDB");

    app.listen(PORT, () => {
        console.log(`Servidor corriendo en puerto ${PORT}`);
    });

})
.catch(err => {
    console.error("Error conectando a MongoDB:", err);
});
