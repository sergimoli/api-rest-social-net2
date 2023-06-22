//importar mòduls
const fs = require("fs");
const path = require("path");

//importar models
const Publication = require("../models/publication");

//importar serveis
const followService = require("../services/followService");

const testPublication = (req, res) => {
  return res.status(200).send({
    message: "message sent from: controllers/publication.js",
  });
};

//guadar publicació
const save = async (req, res) => {
  try {
    //recollir dades del body
    const params = req.body;

    //sino m'arriben donar resposta negativa
    if (!params.text)
      return res.status(400).send({
        status: "error",
        message: "you should send the text of the publicatoin",
      });

    //crear i omplir l'objecte del model
    const newPublication = new Publication(params); //aquí em creat el nou objecte 'newPublicatoin' i li pasem com a dades els params(el 'text')
    newPublication.user = req.user.id; //l'usuari identificat

    //guardar objecte a la bdd
    const saveNewPublication = await newPublication.save();
    if (!saveNewPublication) {
      return res.status(400).send({
        status: "error",
        message: "the publication was not saved",
      });
    }
    //retornar resposta
    return res.status(200).send({
      status: "success",
      message: "publications saved",
      saveNewPublication,
    });
  } catch (error) {
    return res.status(400).send({
      status: "error",
      message: "error saving publication",
    });
  }
};

//treure una sola publciació
const detail = async (req, res) => {
  try {
    //trerue id de la publicació de la url
    const publicationId = req.params.id;

    //find amb la condició de la id
    const findPublication = await Publication.findById(publicationId);
    if (!findPublication) {
      return res.status(400).send({
        status: "error",
        message: "error finding publication",
      });
    }

    return res.status(200).send({
      status: "success",
      message: "show publication",
      findPublication,
    });
  } catch (error) {
    return res.status(400).send({
      status: "error",
      message: "error in detail publication",
    });
  }
};

//eliminar publicacions
const remove = async (req, res) => {
  try {
    //treure id de la publicació a eliminar
    const publicationId = req.params.id; //ens arriba per la url

    //find i remove (les nostres, no de qualevol...)
    const query = { user: req.user.id, _id: publicationId };
    const removePublication = await Publication.deleteMany(query);

    if (!removePublication || removePublication.deletedCount <= 0) {
      return res.status(500).send({
        status: "error",
        message: "no publication to remove",
      });
    }

    //retornar resposta
    return res.status(200).send({
      status: "success",
      message: "ok removing publication",
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "error in remove publication" + error,
    });
  }
};

//listar totes les publicacions
const user = (req, res) => {
  //treure el id d'usuari
  const userId = req.params.id;

  //controlar la pàgina
  let page = 1;
  if (req.params.page) page = req.params.page;
  console.log(req.params.page);
  const itemsPerPage = 5;
  //find, populate, ordenar, paginar
  const query = { user: userId };
  const forcePopulate = {
    path: "user",
    select: "-password -__v -role -email",
  };
  const options = {
    page,
    limit: itemsPerPage,
    sort: { create_at: -1 },
    populate: forcePopulate,
  };
  Publication.paginate(query, options, (error, publications, total) => {
    if (error || !publications || publications.length <= 0) {
      return res.status(404).send({
        status: "error",
        message: "No publications available",
        error,
      });
    }
    return res.status(200).send({
      total,
      status: "success",
      message: "User profile publications",
      user: req.user,
      publications,
    });
  });
};

//pujar fitxers
const upload = async (req, res) => {
  try {
    //treure publication id
    const publicationId = req.params.id;
    //recollir el fitxer de la imatge i comprobar que existeix
    if (!req.file) {
      return res.status(404).send({
        status: "error",
        message: "Petition without image...",
      });
    }
    //conseguir el nom de l'arxiu
    const image = req.file.originalname;

    //treture la extensió de l'arxius
    const imageSplit = image.split(".");
    const extension = imageSplit[1];
    //comporbar extensió
    if (
      extension != "png" &&
      extension != "jpeg" &&
      extension != "jpg" &&
      extension != "gif"
    ) {
      //borrem el fitxer pujat
      const filePath = req.file.path;
      fileDeleted = fs.unlinkSync(filePath);
      //retornar resposta negativa
      return res.status(400).send({
        status: "error",
        message: "file extension not valid",
      });
    }

    console.log("sergi");

    //si tot es correcte guardar la imatge a la bd
    const publicationUpdated = await Publication.findOneAndUpdate(
      // req.user.id,
      { user: req.user.id, _id: publicationId },
      { file: req.file.filename },
      { new: true }
    );

    console.log("sergi2");

    if (!publicationUpdated) {
      return res.status(400).send({
        status: "error",
        message: "error finding/uploading the avatar",
      });
    }

    //retornar resposta
    return res.status(200).send({
      status: "success",
      publication: publicationUpdated,
      file: req.file,
    });
  } catch (error) {
    return res.status(400).send({
      status: "error",
      message: "error uploading the avatar" + error,
    });
  }
};

//retornar fitxers multimèdia
const media = (req, res) => {
  //treure el parametre de la url
  const file = req.params.file;
  //montar el path real de la imatge
  const filePath = "./uploads/publications/" + file;
  //comprobar que existeix
  fs.stat(filePath, (error, exists) => {
    if (!exists) {
      return res.status(404).send({
        status: "error",
        message: "image does not exist",
      });
    }
    //retornar un file
    return res.sendFile(path.resolve(filePath));
  });
};

//llistar publicacions dels usuaris que jo segueixo (FEED)
const feed = async (req, res) => {
  //treure pagina actual
  let page = 1;
  if (req.params.page) page = req.params.page;

  //establir numero d'elements per pagina
  let itemsPerPage = 5;
  try {
    //treure un array de  identificadors d'usuaris que jo segueixo com usuari logueat
    const myFollows = await followService.followUserIds(req.user.id);
    //find a publicacions (IN) ordenar, popular i paginar.
    const query = { user: myFollows.following };
    const forcePopulate = {
      path: "user",
      select: "-password -role -__v -email",
    };
    const options = {
      page: page,
      limit: itemsPerPage,
      populate: forcePopulate,
    };

    Publication.paginate(query, options, async (error, publications, total) => {
      if (error || !publications) {
        return res.status(500).send({
          status: "error",
          message: "no publications to show" + error,
        });
      }
      return res.status(200).send({
        status: "success",
        message: "feed of publications",
        following: myFollows.following,
        total,
        publications,
      });
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "publications are not listed from freed" + error,
    });
  }
};

//exportar accions
module.exports = {
  testPublication,
  save,
  detail,
  remove,
  user,
  upload,
  media,
  feed,
};
