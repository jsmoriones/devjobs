const mongoose = require("mongoose");
const Usuario = mongoose.model("Usuarios");
const multer = require("multer");
const shortid = require("shortid");

const configuracionMulter = {
	limits: { fileSize: 100000 },
	storage: fileStorage = multer.diskStorage({
		destination: (req, file, cb) => {
			cb(null, __dirname+"../../public/uploads/perfiles");
		},
		filename: (req, file, cb) => {
			const extension = file.mimetype.split("/")[1];
			cb(null, `${shortid.generate()}.${extension}`);
		}
	}),
	fileFilter(req, file, cb) {
		if(file.mimetype === "image/jpeg" || file.mimetype === "image/png"){
			cb(null, true);
		}else{
			cb(new Error("Error: Formato no Válido"), false);
		}
	}
}

const upload = multer(configuracionMulter).single("imagen");

exports.subirImage = (req, res, next) => {
	upload(req, res, function(error){
		if(error) {
			if(error instanceof multer.MulterError) {
				if(error.code === "LIMIT_FILE_SIZE"){
					req.flash("error", "El archivo es muy grande: Máximo 100kb");
				} else {
					req.flash("error", error.message);
				}
				res.redirect("/administracion")
				return next();
			}else {
				req.flash("error", error.message);
			}
			res.redirect("/administracion")
			return;
		}else{
			return next();
		}
		//next("jbjkasbdjkasd");
	})
}

exports.formCrearCuenta = (req, res) => {
	res.render("crear-cuenta", {
		nombrePagina: "Crear tu cuenta en devJobs",
		tagline: "Comienza a publicar tus vacantes gratis, solo crear una cuenta"
	})
}

exports.validarRegistro = (req, res, next) => {
	//Sanitizar
	req.sanitizeBody("nombre").escape();
	req.sanitizeBody("email").escape();
	req.sanitizeBody("password").escape();
	req.sanitizeBody("confirmar").escape();

	//Validar
	req.checkBody("nombre", "El Nombre es Obligatorio").notEmpty();
	req.checkBody("email", "El email debe ser valido").isEmail();
	req.checkBody("password", "El password no debe ir vacio").notEmpty();
	req.checkBody("confirmar", "Confirmar Password no debe ir vacio").notEmpty();
	req.checkBody("confirmar", "El Password es diferente").equals(req.body.password);

	const errores = req.validationErrors();

	if(errores){
		// si hay errores
		req.flash("error", errores.map(error => error.msg));

		res.render("crear-cuenta", {
			nombrePagina: "Crear tu cuenta en devJobs",
			tagline: "Comienza a publicar tus vacantes gratis, solo crear una cuenta",
			mensajes: req.flash()
		});
		return;
	}

	// si toda la validacion es correcta
	next();
}

exports.crearUsuario = async (req, res, next) => {
	//creamos el usuario
	const usuario = new Usuario(req.body);

	if(!usuario) return next();

	try{
		await usuario.save();
		res.redirect("/iniciar-sesion")
	}catch(error){
		req.flash("error", error);
		res.redirect("/crear-cuenta")
	}

}

//Metodos de autenticacion
exports.formIniciarSesion = (req, res) => {
	res.render("iniciar-sesion", {
		nombrePagina: "Iniciar Sesión devJobs"
	})
}

//Form Editar el Perfil
exports.formEditarPerfil = (req, res) => {
	res.render("editar-perfil", {
		nombrePagina: "Edita tu Perfil en devJobs",
		usuario: req.user.toObject(),
		nombre: req.user.nombre,
		imagen: req.user.imagen,
		cerrarSesion: true
	})
}

exports.editarPerfil = async (req, res) => {
	const usuario = await Usuario.findById(req.user._id);
	usuario.nombre = req.body.nombre;
	usuario.email = req.body.email;

	if(req.body.password){
		rusuario.password = req.body.password;
	}
	if(req.file){
		usuario.imagen = req.file.filename;
	}

	await usuario.save();

	req.flash("correcto", "Se realizo la actualización correctamente.")

	res.redirect("/administracion")
}

// sanitizar y validar perfil de perfiles
exports.validarPerfil = (req, res, next) => {
	//sanitizar
	req.sanitizeBody("nombre").escape();
	req.sanitizeBody("email").escape();
	if(req.body.password){
		req.sanitizeBody("password").escape();
	}
	//validar
	req.checkBody("nombre", "El Nombre no puede ir vacio").notEmpty();
	req.checkBody("email", "El correo no puede ir vacio").isEmail();
	
	const errores = req.validationErrors();

	if(errores){
		// si hay errores
		req.flash("error", errores.map(error => error.msg));

		res.render("editar-perfil", {
			nombrePagina: "Edita tu Perfil en devJobs",
			usuario: req.user.toObject(),
			nombre: req.user.nombre,
			imagen: req.user.imagen,
			cerrarSesion: true,
			mensajes: req.flash()
		});

		return;
	}

	// si toda la validacion es correcta
	next();
}