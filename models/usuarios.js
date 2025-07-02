const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
const bcrypt = require("bcrypt");

const usuariosSchema = new mongoose.Schema({
	email: {
		type: String,
		unique: true,
		lowercase: true,
		trim: true
	},
	nombre: {
		type: String,
		required: true
	},
	password: {
		type: String,
		required: true,
		trim: true
	},
	token: String,
	expira: Date,
	imagen: String
});

//Metodo para hashear los password
usuariosSchema.pre("save", async function(next) {
	//Si el password ya esta hasheado no hjacemos nada
	if(!this.isModified("password")){
		return next() //deten la ejecucion
	}

	// Si no esta hashedo lo hasheamos
	const hash = await bcrypt.hash(this.password, 12);
	this.password = hash;
	next();
})

//Envia alerta cuando un usuario esta registrado
usuariosSchema.post("save", function(error, doc, next) {
	if(error.name === "MongoServerError" && error.code === 11000){
		console.log(error)
		next("Ese correo ya esta registrado")
	}else{
		next(error)
	}
})

//Autenticar usuarios
usuariosSchema.methods = {
	compararPassword: function(password) {
		console.log("Contraseña ingresada (plana) en compararPassword:", password);
        console.log("Contraseña encriptada en la BD (this.password) en compararPassword:", this.password);
        const resultadoComparacion = bcrypt.compareSync(password, this.password);
        console.log("Resultado de bcrypt.compareSync:", resultadoComparacion);
        return resultadoComparacion;
	}
}

module.exports = mongoose.model("Usuarios", usuariosSchema);