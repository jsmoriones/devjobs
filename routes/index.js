const express = require("express");
const homeController = require("../controllers/homeController");
const vacantesController = require("../controllers/vacantesController");
const usuariosController = require("../controllers/usuariosController");
const authController = require("../controllers/authController");

const router = express.Router();

module.exports = () => {
	router.get('/', homeController.mostrarTrabajos);

	router.get("/vacantes/nueva",
		authController.verificarCuenta,
		vacantesController.formularioNuevaVacante
	);
	router.post("/vacantes/nueva",
		authController.verificarCuenta,
		vacantesController.validarVacante,
		vacantesController.agregarVacante
	);

	//mostrar vacante
	router.get("/vacantes/:url", vacantesController.mostrarVacante);

	//editar vacante
	router.get("/vacantes/editar/:url",
		authController.verificarCuenta,
		vacantesController.editarVacanteFormulario
	);
	router.post("/vacantes/editar/:url",
		authController.verificarCuenta,
		vacantesController.editarVacante
	);

	//eliminar vacante
	router.delete("/vacantes/eliminar/:id",
		vacantesController.eliminarVacante
	)

	//crear cuenta usuario
	router.get("/crear-cuenta", usuariosController.formCrearCuenta);
	router.post("/crear-cuenta",
		usuariosController.validarRegistro,
		usuariosController.crearUsuario
	);

	//autenticacion
	router.get("/iniciar-sesion", usuariosController.formIniciarSesion);
	router.post("/iniciar-sesion", authController.autenticarUsuario);
	router.get("/cerrar-sesion",
		authController.verificarCuenta,
		authController.cerrarSesion
	)

	//Resetear Password (emails)
	router.get("/reestablecer-password", authController.formReestablecerPassword);
	router.post("/reestablecer-password", authController.enviarToken);

	// Resetear Password (Almacenar en la BD)
	router.get("/reestablecer-password/:token", authController.reestablecerPasswordToken);
	router.post("/reestablecer-password/:token", authController.guardarPassword);

	//administracion
	router.get("/administracion",
		authController.verificarCuenta,
		authController.mostrarPanel
	);

	//reclutador
	router.get("/editar-perfil",
		authController.verificarCuenta,
		usuariosController.formEditarPerfil
	);
	router.post("/editar-perfil",
		authController.verificarCuenta,
		//usuariosController.validarPerfil,
		usuariosController.subirImage,
		usuariosController.editarPerfil
	);

	//Recibir Mensajes de Candidatos
	router.post("/vacantes/:url",
		vacantesController.subirCV,
		vacantesController.contactar
	)

	//Mostrar Candidatos
	router.get("/candidatos/:id", vacantesController.mostrarCandidatos);
    
    //buscador
    router.post("/buscador", vacantesController.buscarVacantes);



    router.get('/health', (req, res) => {
	  res.status(200).json({ status: 'OK' });
	});

	return router;
}