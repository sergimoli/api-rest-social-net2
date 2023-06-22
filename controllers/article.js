const Article = require("../models/Article");
const { validateArticle } = require("../helpers/validate");
const fs = require("fs");
const path = require("path");

//article.js --> l'hem posat en minúscula per que es una llibreria de funcions.

// const controller = () => {};

//fem un mètode de proba per veure que funciona el nostre controlador
const test = (req, res) => {
  return res.status(200).json({
    message: "i'm an acction of testing in the articles controller",
  });
};

const course = (req, res) => {
  return res.status(200).json([
    {
      course: "master in react",
      author: "sergi",
      url: "sergiweb@coco.com",
    },
    {
      course: "master in react 2",
      author: "pepitio",
      url: "pepit@oweb.com",
    },
  ]);
};

const save = async (req, res) => {
  //recoollir paràmetres per post a guardar
  let parameters = req.body;
  //validar les dades
  try {
    validateArticle(parameters);
  } catch (error) {
    return res.status(400).json({
      status: "error",
      message: "missing data to send",
    });
  }

  //crear objecte a guardar
  const article = new Article({
    title: req.body.title,
    content: req.body.content,
    author: req.body.author,
  });

  try {
    await article.save();
    res.status(200).json({
      status: "success",
      article: article,
      message: "article saved succesfully, great!!",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      status: "error",
      mensaje: "article has not been saved",
    });
  }
};

const list = async (req, res) => {
  try {
    // let consult = await Article.find({}).limit(3).sort({ date: -1 });
    // let consult = await Article.find({});
    console.log(req.params.last);
    let consult = "";
    if (req.params.last) {
      consult = await Article.find({}).limit(3).sort({ date: -1 });
    } else {
      consult = await Article.find({}).sort({ date: -1 });
    }
    // }
    // console.log(consult);
    res.status(200).json({
      status: "success",
      message: "article found succesfully, yeah!!",
      parameter: req.params.last, //req.params recullo els paràmetres de la url
      counter: consult.length,
      consult,
    });
  } catch (err) {
    return res.status(404).json({
      status: "error" + err,
      mensaje: "articles not found",
    });
  }
};

const one = async (req, res) => {
  try {
    //recollir id per la url
    let id = req.params.id;
    //buscar l'article
    const consultById = await Article.findById(id);
    //retornar resultat
    res.status(200).json({
      status: "success",
      message: "article found succesfully, yeah!!",
      parameter: id, //req.params recullo els paràmetres de la url
      consultById,
    });
    //si no existeix retornar error
  } catch (err) {
    return res.status(404).json({
      status: "error" + err,
      mensaje: "article not found by Id",
    });
  }
};

const deleteById = async (req, res) => {
  try {
    let id = req.params.id;
    const getById = await Article.findOneAndDelete({ _id: id });

    res.status(200).json({
      status: "success",
      message: "article deleted succesfully, yeah!!",
      parameter: id, //req.params recullo els paràmetres de la url
      getById,
    });
  } catch (err) {
    return res.status(500).json({
      status: "error" + err,
      mensaje: "article not deleted by Id",
    });
  }
};

const updateById = async (req, res) => {
  let id = req.params.id;
  let parameters = req.body;
  try {
    validateArticle(parameters);
  } catch (error) {
    return res.status(400).json({
      status: "error",
      message: "missing data to send",
    });
  }

  try {
    const getById = await Article.findOneAndUpdate({ _id: id }, req.body, {
      new: true,
    });

    res.status(200).json({
      status: "success",
      message: "article updated succesfully, yeah!!",
      parameter: id, //req.params recullo els paràmetres de la url
      getById,
    });
  } catch (err) {
    return res.status(500).json({
      status: "error" + err,
      mensaje: "article NOT updated by Id",
    });
  }
};

const push = async (req, res) => {
  //configurar multer per la pujada de fitxers

  //recollir fitxre image pujat
  if (!req.file) {
    return res.status(404).json({
      status: "error",
      message: "image not selected",
    });
  }

  // conseguir nom del fitxer o imatge
  let nameFile = req.file.originalname;

  //conseguir extensió
  let file_splitted = nameFile.split(".");
  let file_extension = file_splitted[1];

  //comprobar extensió correcta
  if (
    file_extension != "png" &&
    file_extension != "jpg" &&
    file_extension != "jpeg" &&
    file_extension != "gif"
  ) {
    //borrar arxiu i donar resposta.
    fs.unlink(req.file.path, (error) => {
      return res.status(400).json({
        status: "error",
        message: "image not valid",
      });
    });
  } else {
    //si tot ok, actualitzar l'article a pujar imatge
    let id = req.params.id;

    try {
      const getById = await Article.findOneAndUpdate(
        { _id: id },
        { image: req.file.filename },
        {
          new: true,
        }
      );

      res.status(200).json({
        status: "success",
        message: "article updated succesfully, yeah!!",
        article: getById,
        file: req.file,
      });
    } catch (err) {
      return res.status(500).json({
        status: "error" + err,
        mensaje: "article NOT updated by Id",
      });
    }
  }
};

const image = (req, res) => {
  let file = req.params.file;
  let fisic_path = "./images/articles/" + file;
  console.log(fisic_path);

  fs.stat(fisic_path, (error, exist) => {
    if (error) {
      console.log(error);
    }
    if (exist) {
      return res.sendFile(path.resolve(fisic_path));
    } else {
      return res.status(404).json({
        status: "error",
        message: "the image does not exist",
        exist,
        file,
        fisic_path,
      });
    }
  });
};

const finder = async (req, res) => {
  //treure el string de busqueda
  let search = req.params.search;
  //find i or a la bd
  try {
    const articlesFound = await Article.find({
      $or: [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ],
    }).sort({ date: -1 });

    if (!articlesFound || articlesFound <= 0) {
      return res.status(404).json({
        status: "error",
        message: "no articles found",
      });
    }

    return res.status(200).json({
      status: "success",
      articles: articlesFound,
    });
  } catch (err) {
    return res.status(404).json({
      status: "error",
      message: "error finding articles",
    });
  }

  //ordenació
  //ejecutar la consulta
  //retornar resultat.
};

module.exports = {
  test,
  course,
  save,
  list,
  one,
  deleteById,
  updateById,
  push,
  image,
  finder,
};
