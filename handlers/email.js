const emailConfig = require("../config/email");
const nodemailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");
const util = require("util");

let transport = nodemailer.createTransport({
	host : emailConfig.host,
	port : emailConfig.port,
	auth: {
		user : emailConfig.user,
		pass : emailConfig.pass
	}
});

transport.use('compile',hbs({
    viewEngine: {
       extname: 'handlebars',
       defaultLayout: false,
    },
    viewPath: __dirname+'/../views/emails',
    extName: '.handlebars',
}));

const sendDateExpira = (date) => {
	const minutos = new Date(date).getTime() / (1000 * 60);
	return minutos;
}

exports.enviar = async (opciones) => {
	const opcionesEmail = {
		from: "devJobs <noreplay@devjobs.com",
		to: opciones.usuario.email,
		subject: opciones.subject,
		template: opciones.archivo,
		context: {
			resetUrl: opciones.resetUrl,
			nombre: opciones.usuario.nombre,
			currentYear: new Date().getFullYear()
		}
	}

	const sendMail = util.promisify(transport.sendMail, transport);
	return sendMail.call(transport, opcionesEmail);
}