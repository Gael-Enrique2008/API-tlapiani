const pool = require("../config/postgres");

const convertirNumero = (valor) => {
    if (valor === undefined || valor === null || valor === "") {
        return null;
    }

    const numero = Number(valor);

    if (Number.isNaN(numero) || !Number.isFinite(numero)) {
        return NaN;
    }

    return numero;
};

const saveMeasurement = async (req, res) => {
    try {
        const {
            device_id,
            flow,
            tds,
            turbidity,
            temperature,
            ph,
            bod,
            latitude,
            longitude
        } = req.body;

        if (!device_id) {
            return res.status(400).json({
                mensaje: "device_id es obligatorio"
            });
        }

        const datos = {
            flow: convertirNumero(flow),
            tds: convertirNumero(tds),
            turbidity: convertirNumero(turbidity),
            temperature: convertirNumero(temperature),
            ph: convertirNumero(ph),
            bod: convertirNumero(bod),
            latitude: convertirNumero(latitude),
            longitude: convertirNumero(longitude)
        };

        const validaciones = [
            { nombre: "flow", valor: datos.flow, min: 0, max: 100 },
            { nombre: "tds", valor: datos.tds, min: 0, max: 2000 },
            { nombre: "turbidity", valor: datos.turbidity, min: 0, max: 5000 },
            { nombre: "temperature", valor: datos.temperature, min: -10, max: 80 },
            { nombre: "ph", valor: datos.ph, min: 0, max: 14 },
            { nombre: "bod", valor: datos.bod, min: 0, max: 100 },
            { nombre: "latitude", valor: datos.latitude, min: -90, max: 90 },
            { nombre: "longitude", valor: datos.longitude, min: -180, max: 180 }
        ];

        for (const campo of validaciones) {
            if (campo.valor !== null) {
                if (Number.isNaN(campo.valor)) {
                    return res.status(400).json({
                        mensaje: `${campo.nombre} debe ser un número válido`
                    });
                }

                if (campo.valor < campo.min || campo.valor > campo.max) {
                    return res.status(400).json({
                        mensaje: `${campo.nombre} está fuera del rango permitido`
                    });
                }
            }
        }

        await pool.query(
            `
            INSERT INTO measurements
            (
                device_id,
                flow,
                tds,
                turbidity,
                temperature,
                ph,
                bod,
                latitude,
                longitude
            )
            VALUES
            (
                $1,$2,$3,$4,$5,$6,$7,$8,$9
            )
            `,
            [
                device_id,
                datos.flow,
                datos.tds,
                datos.turbidity,
                datos.temperature,
                datos.ph,
                datos.bod,
                datos.latitude,
                datos.longitude
            ]
        );

        res.status(200).json({
            mensaje: "Medición guardada"
        });

    } catch (error) {
        res.status(500).json({
            mensaje: "Error al guardar medición",
            error: error.message
        });
    }
};

module.exports = {
    saveMeasurement
};