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

const clasificarMedicion = (datos) => {
    if (
        datos.ph < 6.5 || datos.ph > 8.5 ||
        datos.tds > 1000 ||
        datos.turbidity > 100 ||
        datos.temperature > 45 ||
        datos.bod > 30
    ) {
        return "riesgo";
    }

    if (
        datos.ph < 6.8 || datos.ph > 8.2 ||
        datos.tds > 500 ||
        datos.turbidity > 50 ||
        datos.temperature > 35 ||
        datos.bod > 15
    ) {
        return "alerta";
    }

    return "normal";
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
            //temperature: convertirNumero(temperature),
            temperature: 0,
            ph: convertirNumero(ph),
            bod: convertirNumero(bod),
            latitude: convertirNumero(latitude),
            longitude: convertirNumero(longitude)
        };

        const validaciones = [
            { nombre: "flow", valor: datos.flow, min: 0, max: 100 },
            { nombre: "tds", valor: datos.tds, min: 0, max: 2000 },
            { nombre: "turbidity", valor: datos.turbidity, min: 0, max: 5000 },
            //{ nombre: "temperature", valor: datos.temperature, min: -10, max: 80 },
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

        const dispositivoExiste = await pool.query(
            "SELECT * FROM dispositivos WHERE device_id = $1",
            [device_id]
        );

        if (dispositivoExiste.rows.length === 0) {
            return res.status(404).json({
                mensaje: "Dispositivo no registrado"
            });
        }

        const estado = clasificarMedicion(datos);

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
                longitude,
                estado
            )
            VALUES
            (
                $1,$2,$3,$4,$5,$6,$7,$8,$9,$10
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
                datos.longitude,
                estado
            ]   
        );

        res.status(200).json({
            mensaje: "Medición guardada",
            estado
        });

    } catch (error) {
        res.status(500).json({
            mensaje: "Error al guardar medición",
            error: error.message
        });
    }
};

const getMeasurements = async (req, res) => {
    try {
        const { device_id } = req.query;

        if (!device_id) {
            return res.status(400).json({
                mensaje: "device_id es obligatorio"
            });
        }

        const result = await pool.query(
            `
            SELECT
                device_id,
                flow,
                tds,
                turbidity,
                temperature,
                ph,
                bod,
                latitude,
                longitude,
                estado,
                created_at AS timestamp
            FROM measurements
            WHERE device_id = $1
            ORDER BY created_at DESC
            LIMIT 100
            `,
            [device_id]
        );

        res.status(200).json(result.rows);

    } catch (error) {
        res.status(500).json({
            mensaje: "Error al obtener mediciones",
            error: error.message
        });
    }
};
module.exports = {
    saveMeasurement,
    getMeasurements
};