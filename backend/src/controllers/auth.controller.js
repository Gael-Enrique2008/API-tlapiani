const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const pool = require("../config/postgres");
const { validarTexto, validarCorreo, validarPassword, validarCelular, validarLogin } = require("../utils/validators");

const register = async (req, res) => {
    try {
        let { nombre, apellido, username, correo, password, celular } = req.body;

        const errorNombre = validarTexto(nombre, "El nombre", 2, 50);

        if (errorNombre) {
            return res.status(400).json({
                mensaje: errorNombre
            });
        }

        const errorApellido = validarTexto(apellido, "El apellido", 2, 50);

        if (errorApellido) {
            return res.status(400).json({
                mensaje: errorApellido
            });
        }

        const errorUsername = validarTexto(username, "El nombre de usuario", 3, 20);

        if (errorUsername) {
            return res.status(400).json({
                mensaje: errorUsername
            });
        }

        const errorCorreo = validarCorreo(correo);

        if (errorCorreo) {
            return res.status(400).json({
                mensaje: errorCorreo
            });
        }

        const errorPassword = validarPassword(password);

        if (errorPassword) {
            return res.status(400).json({
                mensaje: errorPassword
            });
        }

        const errorCelular = validarCelular(celular);

        if (errorCelular) {
            return res.status(400).json({
                mensaje: errorCelular
            });
        }

        const userExists = await User.findOne({ correo });

        if (userExists) {
            return res.status(400).json({
                mensaje: "El correo ya está registrado"
            });
        }

        const usernameExists = await User.findOne({ username });

        if (usernameExists) {
            return res.status(400).json({
                mensaje: "El nombre de usuario ya está registrado"
            });
        }

        nombre = nombre.trim();
        apellido = apellido.trim();
        username = username.trim().toLowerCase();
        correo = correo.trim().toLowerCase();
        celular = celular ? celular.trim() : null;
        password = password.trim();

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            nombre,
            apellido,
            username,
            correo,
            password: hashedPassword,
            celular
        });

        await newUser.save();

        res.status(201).json({
            mensaje: "Usuario registrado correctamente"
        });
    } catch (error) {
        res.status(500).json({
            mensaje: "Error al registrar usuario",
            error: error.message
        });
    }
};

const login = async (req, res) => {
    try {
        let { usuarioOCorreo, password } = req.body;

        const errorLogin = validarLogin(usuarioOCorreo, password);

        if (errorLogin) {
            return res.status(400).json({
                mensaje: errorLogin
            });
        }

        usuarioOCorreo = usuarioOCorreo.trim().toLowerCase();
        password = password.trim();

        const user = await User.findOne({
            $or: [
                { username: usuarioOCorreo },
                { correo: usuarioOCorreo }
            ]
        });

        if (!user) {
            return res.status(400).json({
                mensaje: "Usuario o contraseña incorrectos"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({
                mensaje: "Usuario o contraseña incorrectos"
            });
        }

        const token = jwt.sign(
            { id: user._id, username: user.username, correo: user.correo },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.status(200).json({
            mensaje: "Inicio de sesión exitoso",
            token
        });
    } catch (error) {
        res.status(500).json({
            mensaje: "Error al iniciar sesión",
            error: error.message
        });
    }
};

const addDevice = async (req, res) => {
    try {
        const { device_id, nombre } = req.body;

        if (!device_id || !device_id.trim()) {
            return res.status(400).json({
                mensaje: "El device_id es obligatorio"
            });
        }

        const deviceIdLimpio = device_id.trim();

        const existe = await pool.query(
            "SELECT * FROM dispositivos WHERE device_id = $1",
            [deviceIdLimpio]
        );

        if (existe.rows.length > 0) {
            return res.status(400).json({
                mensaje: "Ese dispositivo ya está vinculado"
            });
        }

        await pool.query(
            `
            INSERT INTO dispositivos
            (device_id, usuario_id, nombre)
            VALUES ($1, $2, $3)
            `,
            [
                deviceIdLimpio,
                req.user.id,
                nombre ? nombre.trim() : "Dispositivo Tlapiani"
            ]
        );

        res.status(201).json({
            mensaje: "Dispositivo vinculado correctamente"
        });

    } catch (error) {
        res.status(500).json({
            mensaje: "Error al vincular dispositivo",
            error: error.message
        });
    }
};
    
module.exports = {
    register,
    login,
    addDevice
};