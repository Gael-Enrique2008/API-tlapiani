const validarTexto = (valor, nombreCampo, min = 2, max = 50) => {
    if (!valor) {
        return `${nombreCampo} es obligatorio`;
    }

    if (typeof valor !== "string") {
        return `${nombreCampo} debe ser texto`;
    }

    const valorLimpio = valor.trim();

    if (valorLimpio.length === 0) {
        return `${nombreCampo} no puede estar vacío`;
    }

    if (valorLimpio.length < min) {
        return `${nombreCampo} debe tener al menos ${min} caracteres`;
    }

    if (valorLimpio.length > max) {
        return `${nombreCampo} no puede tener más de ${max} caracteres`;
    }

    return null;
};

const validarCorreo = (correo) => {
    if (!correo) {
        return "El correo es obligatorio";
    }

    if (typeof correo !== "string") {
        return "El correo debe ser texto";
    }

    const correoLimpio = correo.trim();

    if (correoLimpio.length === 0) {
        return "El correo no puede estar vacío";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correoLimpio)) {
        return "El correo no es válido";
    }

    return null;
};

const validarPassword = (password) => {
    if (!password) {
        return "La contraseña es obligatoria";
    }

    if (typeof password !== "string") {
        return "La contraseña debe ser texto";
    }

    const passwordLimpio = password.trim();

    if (passwordLimpio.length === 0) {
        return "La contraseña no puede estar vacía";
    }

    if (passwordLimpio.length < 8) {
        return "La contraseña debe tener al menos 8 caracteres";
    }

    if (passwordLimpio.length > 64) {
        return "La contraseña no puede tener más de 64 caracteres";
    }

    return null;
};

const validarCelular = (celular) => {
    if (!celular) {
        return null; // El celular es opcional
    }

    if (typeof celular !== "string") {
        return "El celular debe ser texto";
    }

    const celularLimpio = celular.trim();

    if (celularLimpio.length === 0) {
        return "El celular no puede estar vacío";
    }

    if (!/^\d{10}$/.test(celularLimpio)) {
        return "El celular no es válido";
    }

    return null;
};

const validarLogin = (usuarioOCorreo, password) => {
    if (!usuarioOCorreo) {
        return "El usuario o correo es obligatorio";
    }

    if (typeof usuarioOCorreo !== "string") {
        return "El usuario o correo debe ser texto";
    }

    const usuarioOCorreoLimpio = usuarioOCorreo.trim();

    if (usuarioOCorreoLimpio.length === 0) {
        return "El usuario o correo no puede estar vacío";
    }

    const errorPassword = validarPassword(password);

    if (errorPassword) {
        return errorPassword;
    }

    return null;
};

module.exports = {
    validarTexto,
    validarCorreo,
    validarPassword,
    validarCelular,
    validarLogin 
};