const mongoose = require('mongoose');
require('./config/db.js')

const express = require("express");
const exphbs = require("express-handlebars");
const path = require("path")
const cookieParser = require("cookie-parser")
const session = require("express-session")
const MongoStore = require("connect-mongo");
const bodyParser = require("body-parser");
const expressValidator = require("express-validator");
const flash = require("connect-flash");
const colors = require("colors");
const createError = require("http-errors");

const passport = require("./config/passport");

const store = MongoStore.create({
  mongoUrl: process.env.DATABASE
});

const router = require("./routes")

require("dotenv").config({path: "variables.env"})

const app = express();

app.use( bodyParser.json() )
app.use( bodyParser.urlencoded({ extended: true }) );

//Usamos express validator para la validacion de formularios
app.use( expressValidator() );


//habilitar handlebars como view
app.engine("handlebars",
	exphbs.engine({
		defaultLayout: "layout",
		helpers: require("./helpers/handlebars")
	})
);
app.set("view engine", "handlebars");

//archivos estaticos
app.use(express.static(path.join(__dirname, 'public')));

app.use(cookieParser());

app.use(
  session({
    secret: process.env.SECRET,
	key: process.env.KEY,
	resave: false,
	saveUninitialized: false,
	store: store
  })
);

//inicializar passport
app.use(passport.initialize());
app.use(passport.session());

//Usamos flash para alertas y menasjes
app.use( flash() );

app.use((req, res, next) => {
	res.locals.mensajes = req.flash();
	next();
});

app.use("/", router());

//404 pagina no encontrada
app.use((req, res, next) => {
	next(createError(404, "No Encontrado"));
})

//Administración de los errores
app.use((error, req, res, next) => {
	res.locals.mensaje = error.message;
	const status = error.status || 500;
	res.locals.status = status;
	res.status(status);
	res.render("error");
})

//Heroki asigna el puerto
const host = '0.0.0.0';
const port = process.env.PORT;

app.listen(host, port, () => {
	console.log( "El servidor esta funcionando" )
});