import axios from "axios";
import Swal from "sweetalert2";

document.addEventListener("DOMContentLoaded", () => {
	const skills = document.querySelector(".lista-conocimientos");

	//limpiar dinamicamente las alertas
	const alertas = document.querySelector(".alertas");

	if(alertas){
		limpiarAlertas();
	}

	if(skills){
		skills.addEventListener("click", agregarSkills);
		agregarSeleccionadas();
	}

	const vacantesListado = document.querySelector(".panel-administracion");

	if(vacantesListado){
		vacantesListado.addEventListener("click", accionesListado);
	}
})
const skills = new Set();
const agregarSkills = e => {
	if(e.target.tagName === "LI"){
		if(e.target.classList.contains("activo")){
			//eliminamos el skill del arreglo
			skills.delete(e.target.textContent);
			e.target.classList.remove("activo");
		}else{
			//si no existe lo agregamos y pintamos
			skills.add(e.target.textContent);
			e.target.classList.add("activo");
		}
	}
	const skillsArray = [...skills];
	document.querySelector("#skills").value = skillsArray;
}

const agregarSeleccionadas = () => {
	const seleccionadas = Array.from( document.querySelectorAll(".lista-conocimientos .activo") );

	seleccionadas.forEach(seleccionada => skills.add(seleccionada.textContent));

	const skillsArray = [...skills];
	document.querySelector("#skills").value = skillsArray;
}

const limpiarAlertas = () => {
	const alertas = document.querySelector(".alertas");
	const interval = setInterval(() => {
		if(alertas.children.length > 0){
			alertas.removeChild(alertas.children[0]);
		}else if(alertas.children.length === 0){
			alertas.parentElement.removeChild(alertas);
			clearInterval(interval);
		}
	}, 2000);
}

const accionesListado = e => {
	e.preventDefault();

	if(e.target.dataset.eliminar){

		
		Swal.fire({
		  title: "¿Confirmar Eliminación?",
		  text: "Una vez eliminado, no se puede recuperar",
		  icon: "warning",
		  showCancelButton: true,
		  confirmButtonColor: "#3085d6",
		  cancelButtonColor: "#d33",
		  confirmButtonText: "Si, eliminar",
		  cancelButtonText: "No, Cancelar"
		}).then((result) => {
		  if (result.isConfirmed) {

		  	const url = `${window.location.origin}/vacantes/eliminar/${e.target.dataset.eliminar}`;

		  	axios.delete(url, {params: {url} })
		  		.then(function(response) {
		  			if(response.status === 200){
					    Swal.fire({
					      title: "Eliminado!",
					      text: response.data,
					      icon: "success"
					    });

					    //Eliminar del DOM
					    e.target.parentElement.parentElement.parentElement.removeChild(e.target.parentElement.parentElement);
		  			}
		  		})
		  		.catch(() => {
		  			Swal.fire({
		  				icon: "error",
		  				title: "Hubo un error",
		  				text: "No se pudo eliminar"
		  			})
		  		});
		  }
		});
	}else if(e.target.href){
		window.location.href = e.target.href;
	}
}