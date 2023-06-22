const express = require("express");
const router = express.Router();
const followController = require("../controllers/follow");
const check = require("../middlewares/auth");

//definir rutes
router.get("/test-follow", followController.testFollow);

router.post("/save", check.auth, followController.save);

router.delete("/unfollow/:id", check.auth, followController.unfollow);

router.get("/following/:id?/:page?", check.auth, followController.following);
router.get("/followers/:id?/:page?", check.auth, followController.followers);

//exportar router
module.exports = router;
