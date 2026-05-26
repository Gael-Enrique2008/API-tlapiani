const pool = require("../config/postgres");

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
                flow,
                tds,
                turbidity,
                temperature,
                ph,
                bod,
                latitude,
                longitude
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