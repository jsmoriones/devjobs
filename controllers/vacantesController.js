const mongoose = require("mongoose");
const Vacante = mongoose.model("Vacante");
const multer = require("multer");
const shortid = require("shortid");

exports.formularioNuevaVacante = (req, res) => {
  res.render("nueva-vacante", {
    nombrePagina: "Nueva Vacante",
    tagline: "Llena el formulario y publica tu vacante",
    nombre: req.user.nombre,
    imagen: req.user.imagen,
    cerrarSesion: true
  })
}

exports.agregarVacante = async(req, res) => {
  //console.log(req.body)

  const vacante = new Vacante(req.body);

  //agregando autor
  vacante.autor = req.user._id;

  //aplicar formato de arreglo a los skills
  vacante.skills = req.body.skills.split(',');

  //console.log(vacante)

  //Guardar en la base de datos la vacante
  const newVacante = await vacante.save();

  //redireccionar
  res.redirect(`/vacantes/${newVacante.url}`);
}

exports.mostrarVacante = async(req, res, next) => {
  const vacante = await Vacante.findOne({ url: req.params.url }).populate("autor").lean();

  console.log(vacante)

  if(!vacante) return next();

  res.render("vacante", {
    nombrePagina: vacante.titulo,
    barra: true,
    boton: false,
    nombre: req.user.nombre,
    imagen: req.user.imagen,
    vacante
  })
}

exports.editarVacanteFormulario = async (req, res, next) => {
  const vacante = await Vacante.findOne({ url: req.params.url }).lean();

  if(!vacante) return next();

  res.render("vacante-editar" ,{
    nombrePagina: `Editar - ${vacante.titulo}`,
    barra: true,
    boton: false,
    vacante
  })
}

exports.editarVacante = async (req, res) => {
  const vacanteActualizada = req.body;

  vacanteActualizada.skills = req.body.skills.split(",");

  //console.log(vacanteActualizada);

  const vacante = await Vacante.findOneAndUpdate(
    {url: req.params.url},
    vacanteActualizada,
    {
      new: true,
      runValidators: true
    }
  )

  console.log(vacante)

  res.redirect(`/vacantes/${vacante.url}`);
}

exports.validarVacante = (req, res, next) => {
  //sanitizando los campos
  req.sanitizeBody("titulo").escape();
  req.sanitizeBody("empresa").escape();
  req.sanitizeBody("ubicacion").escape();
  req.sanitizeBody("salario").escape();
  req.sanitizeBody("contrato").escape();
  req.sanitizeBody("skills").escape();

  //validar
  req.checkBody("titulo", "Agrega un Titulo a la vacante").notEmpty();
  req.checkBody("empresa", "Agrega una Empresa").notEmpty();
  req.checkBody("ubicacion", "Agrega una ubicación").notEmpty();
  req.checkBody("contrato", "Selecciona el Tipo de Contrato").notEmpty();
  req.checkBody("skills", "Agrega al menos una habilidad").notEmpty();

  const errores = req.validationErrors();

  if(errores){
    req.flash("error", errores.map(error => error.msg));

    res.render("nueva-vacante", {
      nombrePagina: "Nueva Vacante",
      tagline: "Llena el formulario y publica tu vacante",
      nombre: req.user.nombre,
      cerrarSesion: true,
      mensajes: req.flash()
    });

    return;
  }

  next();
}

//Eliminar Vacante
exports.eliminarVacante = async (req, res) => {
  const {id} = req.params;

  try{

    const vacante = await Vacante.findById(id);
    
    if(!vacante){
      return res.status(404).send("No existe vacante")
    }

    if(verificarVacante(vacante, req.user)){
      await vacante.deleteOne();
      res.status(200).send("Vacante Eliminada Correctamente");
    }else{
      res.status(403).send("Error")
    }
  }catch(error){
    console.log(error)
  }


}

const verificarVacante = (vacante = {}, usuario = {}) => {
  if(!vacante.autor.equals(usuario._id)){
    return false;
  }
  return true;
}

const configuracionMulter = {
  limits: { fileSize: 200000 },
  storage: fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, __dirname+"../../public/uploads/cv");
    },
    filename: (req, file, cb) => {
      const extension = file.mimetype.split("/")[1];
      cb(null, `${shortid.generate()}.${extension}`);
    }
  }),
  fileFilter(req, file, cb) {
    if(file.mimetype === "application/pdf"){
      cb(null, true);
    }else{
      cb(new Error("Error: Formato no Válido"), false);
    }
  }
}

const upload = multer(configuracionMulter).single("cv");

exports.subirCV = (req, res, next) => {
  upload(req, res, function(error){
    if(error) {
      if(error instanceof multer.MulterError) {
        if(error.code === "LIMIT_FILE_SIZE"){
          req.flash("error", "El archivo es muy grande: Máximo 200kb");
        } else {
          req.flash("error", error.message);
        }
        res.redirect(req.get('Referer') || '/');
        return next();
      }else {
        req.flash("error", error.message);
      }
      res.redirect(req.get('Referer') || '/');
      return;
    }else{
      return next();
    }
    //next("jbjkasbdjkasd");
  })
}

exports.contactar = async (req, res, next) => {
  const vacante = await Vacante.findOne({ url: req.params.url });

  //sino existe la vacante
  if(!vacante) return next();

  //si todo bien construir el nuevo objeto
  const nuevoCandidato = {
    nombre: req.body.nombre,
    email: req.body.email,
    cv: req.file.filename
  }

  //almacenar la vacante
  vacante.candidatos.push(nuevoCandidato);
  await vacante.save();

  //mensaje y redireccionamiento
  req.flash("correcto", "Se envio tu Curriculum correctamente");
  res.redirect("/");
}

exports.mostrarCandidatos = async(req, res, next) => {
  const vacante = await Vacante.findById(req.params.id).lean();

  if(vacante.autor != req.user._id.toString()){
    return next();
  }

  if(!vacante) return next();

  res.render("candidatos", {
    nombrePagina: `Candidatos Vacante - ${vacante.titulo}`,
    cerrarSesion: true,
    nombre: req.user.nombre,
    imagen: req.user.imagen,
    candidatos: vacante.candidatos
  })
}

exports.buscarVacantes = async (req, res) => {
    const vacantes = await Vacante.find({
        $text : {
            $search : req.body.q
        }
    }).lean();
    
    res.render("home", {
        nombrePagina: `Resultados para la busqueda: ${req.body.q}`,
        barra: true,
        vacantes
    })
}