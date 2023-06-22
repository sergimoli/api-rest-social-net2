const express = require("express");
const router = express.Router();
const userController = require("../controllers/user");
const check = require("../middlewares/auth");
const multer = require("multer"); //per fer pujades (es un middleware)

//configuració de pujada.
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/avatars");
  },

  filename: (req, file, cb) => {
    cb(null, "avatar-" + Date.now() + "-" + file.originalname);
  },
});
const uploads = multer({ storage });

//definir rutes
router.get("/test-user", check.auth, userController.testUser);

router.post("/register", userController.register);
router.post("/login", userController.login);

router.get("/profile/:id", check.auth, userController.profile);

router.get("/list/:page?", check.auth, userController.list);

router.put("/update", check.auth, userController.update);

router.post(
  "/upload",
  [check.auth, uploads.single("file")],
  userController.upload
);

router.get("/avatar/:file", userController.avatar);

router.get("/counters/:id", check.auth, userController.counters);

//exportar router
module.exports = router;
