//dependencias necesarias

//modulo principal de passport
const passport = require("passport");
//passport-local nos permite una autenticacion local osea desde nuestra BD
const LocalStrategy = require("passport-local").Strategy;
//importamos mongoose para manipular los registros de usuarios
const mongoose = require("mongoose");
//llamamos nuestro modelo de usuarios
const Usuarios = mongoose.model("Usuarios");

//configuracion de passport para la autenticacion

/*
	lo que puedo entender es que a passport se le pasa un middleware de passport-local osea LocalStrategy donde se configuran los valores de autenticacion como son email y password, despues de esto entra en juego la funcion que hace la consulta a la base de datos para verificar valores de entrada con los de la BD
*/
passport.use(new LocalStrategy({
	usernameField: "email",
	passwordField: "password"
	}, async (email, password, done) => {
		const usuario = await Usuarios.findOne({ email });
		// en done el primer valor es errores, el segundo es si hay susuarios y el tercero es un objeto de mensajes
		if(!usuario) return done(null, false, {
			message: "Usuario No Existente"
		});

		const verificarPass = usuario.compararPassword(password);
		console.log("VErificar: ", verificarPass)
		if(!verificarPass) return done(null, false, {
			message: "Password Incorrecto"
		});

		console.log(usuario)
		//Usuario correcto y el password es correcto
		return done(null, usuario);
	}));

//esta funcion es la que se ejecuta una vez el usuario inicio sesion, aqui le decimos en done que no hay errores y que guarde solamente el id de usuario
passport.serializeUser((usuario, done) => done(null, usuario._id));

//esta funcion es la inversa a la anterior, en esta recuperamos el id del usuario logueado, hacemos una consulta a la BD por el id y devolvemos el usuario completo.
passport.deserializeUser(async (id, done) => {
	const usuario = await Usuarios.findById(id);
	return done(null, usuario);
})

module.exports = passport;