//no respresentem una entitat, per això el nom en minúscula de 'article.js'
const express = require("express");
const router = express.Router();
const multer = require("multer");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./images/articles");
  },
  filename: (req, file, cb) => {
    cb(null, "article" + Date.now() + file.originalname);
  },
}); //a quina carpeta guardo

const pushes = multer({ storage: storage });

const ArticleController = require("../controllers/article");

//rutes de proba
router.get("/test-route", ArticleController.test);
router.get("/course", ArticleController.course);

//ruta útil
//post es per a guardar un recurs
router.post("/save", ArticleController.save);

//al possar-li un interrogant el paràmetre no es obligatori.
router.get("/articles/:last?", ArticleController.list);

router.get("/article/:id", ArticleController.one);

router.delete("/article/:id", ArticleController.deleteById);

router.put("/article/:id", ArticleController.updateById);

//middleware --> mètode que s'executa abans de l'accion del controlador
router.post("/push-image/:id", [pushes.single("file")], ArticleController.push);

router.get("/image/:file", ArticleController.image);
router.get("/find/:search", ArticleController.finder);

module.exports = router;
