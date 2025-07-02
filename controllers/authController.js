const passport = require("passport");
const mongoose = require("mongoose");
const Vacante = mongoose.model("Vacante");
const Usuarios = mongoose.model("Usuarios");
const crypto = require("crypto");
const enviarEmail = require("../handlers/email");

exports.autenticarUsuario = passport.authenticate("local", {
	successRedirect : "/administracion",
	failureRedirect : "/iniciar-sesion",
	failureFlash: true,
	badRequestMessage: "Ambos campos son obligatorios"
})

exports.mostrarPanel = async (req, res) => {
	//consulto las vacantes creadas por el usuario que inicio sesion
	const vacantes = await Vacante.find({ autor: req.user._id }).lean();

	res.render("administracion", {
		nombrePagina: "Administracion devJobs",
		tagline: "Aqui podras adminstrar el contenido del sitio",
		vacantes,
		nombre: req.user.nombre,
		imagen: req.user.imagen,
		cerrarSesion: true
	})
}

//revisamos si el usuario esta creado
exports.verificarCuenta = (req, res, next) => {
	//revisar el usuario
	if(req.isAuthenticated()){ // el isAuthenticated es propio de passport
		return next();
	}

	res.redirect("/iniciar-sesion");
}

//cerrar la sesion iniciada
exports.cerrarSesion = (req, res) => {
	req.logout(function(err){
        if(err) {
            return next(err);
        }
        req.flash("correcto", "Cerraste sesion correctamente");
        return res.redirect('/iniciar-sesion')
    });
}

//Reestablecer el Password
exports.formReestablecerPassword = (req, res) => {
	res.render("reestablecer-password", {
		nombrePagina: "Reestablece tu Password",
		tagline: "Si ya tienes una cuenta pero olvidaste tu password, coloca tu email"
	})
}

exports.enviarToken = async (req, res, next) => {
	const usuario = await Usuarios.findOne({email: req.body.email});

	if(!usuario){
		req.flash("error", "No existe una cuenta");
		return res.redirect("/iniciar-sesion");
	}

	// el usuario existe generar token y expiracion
	usuario.token = crypto.randomBytes(20).toString("hex");
	usuario.expira = Date.now() + 3600000;

	//Guardar usuario con token y expira
	await usuario.save();
	const resetUrl = `http://${req.headers.host}/reestablecer-password/${usuario.token}`;

	console.log(resetUrl);

	await enviarEmail.enviar({
		usuario,
		subject: "Password Reset",
		resetUrl,
		archivo: "reset"
	});

	req.flash("correcto", "Revisa tu email para las indicaciones");
	return res.redirect("/iniciar-sesion");
}

//Valida si el token es valido y el usuario existe, muestra la vista
exports.reestablecerPasswordToken = async (req, res, next) => {
	const usuario = await Usuarios.findOne({
		token: req.params.token,
		expira: {
			$gt: Date.now()
		}
	});

	if(!usuario){
		req.flash("error", "El formulario ya no es valido, intenta de nuevo");
		return res.redirect("/reestablecer-password");
	}

	res.render("nuevo-password", {
		nombrePagina: "Nuveo Password"
	})
}

//Almacenar password
exports.guardarPassword = async(req, res) => {
	const usuario = await Usuarios.findOne({
		token: req.params.token,
		expira: {
			$gt: Date.now()
		}
	});

	console.log("Este es el usuario de guardarPassword: ", usuario);

	//no existe el usuario o ya expiro el codigo
	if(!usuario){
		req.flash("error", "El formulario ya no es valido, intenta de nuevo");
		return res.redirect("/reestablecer-password");
	}

	//asignar neuvo passord, y limpiar valores previos
	usuario.password = req.body.password;
	usuario.token = undefined;
	usuario.expira = undefined;

	//agregart y eliminar valores previos
	await usuario.save();

	//redirijimos al home
	req.flash("correcto", "Password Modificado correctamente");
	res.redirect("/iniciar-sesion");
}