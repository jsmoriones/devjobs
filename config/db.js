const mongoose = require("mongoose");
require("dotenv").config({path: "variables.env"})

mongoose.connect(process.env.DATABASE_AUTH, {useNewUrlParser: true})

mongoose.connection.on('error', (error) => {
	console.log(error);
})

require("../models/vacantes.js");
require("../models/usuarios.js");