//importar dependències i mòduls
const User = require("../models/user");
const bCrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");
// const mongoosePaginate = require("mongoose-pagination");

//importem serveis
const jwt = require("../services/jwt");
const user = require("../models/user");
const followService = require("../services/followService");
const { following } = require("./follow");
const Publication = require("../models/publication");
const Follow = require("../models/follow");

const validate = require("../helpers/validate");

//accions de proba
const testUser = (req, res) => {
  return res.status(200).send({
    message: "message sent from: controllers/user.js",
    user: req.user,
  });
};

//registre usuari
const register = async (req, res) => {
  //recollir dates de la petició
  const params = req.body;
  //comprar que arriba bé (+validació)
  if (
    !params.name ||
    !params.surname ||
    !params.email ||
    !params.password ||
    !params.nick
  ) {
    return res.status(400).json({
      status: "error",
      message: "check required fields, please...",
    });
  } else {
    console.log("minimal validation ok!");
    try {
      //validació avançada.
      validate(params);
    } catch (error) {
      return res.status(400).json({
        status: "error",
        message: "validation not correct",
      });
    }

    //si hi ha element ususari o nick que sigui exament el mateix vol dir que el usuari ja existeix.
    try {
      //control usuaris duplicats
      const findUserAlreadyExist = await User.find({
        $or: [
          { email: params.email.toLowerCase() },
          { nick: params.nick.toLowerCase() },
        ],
      });

      if (findUserAlreadyExist && findUserAlreadyExist.length >= 1) {
        return res.status(200).send({
          status: "error",
          message: "the user already exists",
        });
      }

      //xifrar contrasenya
      const pwd = await bCrypt.hash(params.password, 10);
      params.password = pwd;

      //crear objecte d'usuari
      const userToSave = new User(params); //User es l'objecte del model
      console.log(userToSave);

      // //guardar usuari en la bbdd
      await userToSave.save();

      //retornem resultat
      return res.status(200).send({
        status: "success",
        message: "action user register",
        userToSave,
      });
    } catch (error) {
      return res.status(500).send({
        status: "error",
        message: "error in the users query",
      });
    }
  }
};

const login = async (req, res) => {
  //Recollir paràmetres body
  const params = req.body;
  if (!params.email || !params.password) {
    return res.status(400).send({
      status: "error",
      message: "Missing data to send",
    });
  }
  try {
    //buscar a la bbdd si existeix
    const findUser = await User.findOne({ email: params.email });
    //.select({ password: 0 });  això seria per no mostrar el password. però ho farem més endavant...

    if (!findUser) {
      return res.status(404).send({
        status: "error",
        message: "the user does not exist",
      });
    }

    //comprobar la contrasenya
    const pwd = bCrypt.compareSync(params.password, findUser.password); //comparo les dues contrasenyes
    if (!pwd) {
      return res.status(404).send({
        status: "error",
        message: "the password is wrong, my friend...",
      });
    }
    //conseguir token
    // console.log(findUser);
    const token = jwt.crateToken(findUser);

    //retornar dades de l'usuari
    return res.status(200).send({
      status: "success",
      message: "you've been indentified correctly",
      findUser: {
        id: findUser._id,
        name: findUser.name,
        nick: findUser.nick,
      },
      token,
    });
  } catch (error) {
    return res.status(404).send({
      status: "error",
      message: "error retrieving the user, man!..." + error,
    });
  }
};

//retornar info de l'usuari que li anirem a pasar per la url
const profile = async (req, res) => {
  try {
    //rebre el paràmetre del id d'usuari per la url
    const id = req.params.id;
    //consulta per treure les dade de l'usuari
    const userProfile = await User.findById(id).select({
      password: 0,
      role: 0,
    });
    if (!userProfile) {
      return res.status(404).send({
        status: "error",
        message: "the user does not exist",
      });
    }

    //info de seguiment
    const followInfo = await followService.followThisUser(req.user.id, id);
    //retornar el resultat

    return res.status(200).send({
      status: "success",
      user: userProfile,
      following: followInfo.following,
      follower: followInfo.follower,
    });
  } catch (error) {
    return res.status(404).send({
      status: "error",
      message: "there is an error finding the profile...",
    });
  }
};

const list = (req, res) => {
  //controlar en quina àgina estic
  let page = 1;
  if (req.params.page) {
    page = req.params.page;
  }
  page = parseInt(page);

  //consulta amb monoose paginate
  const itemsPerPage = 10;
  const forcePopulate = {
    // path: "user followed",
    path: "docs",
    select: "-password -role -__v -email",
  };
  const options = {
    page: page,
    limit: itemsPerPage,
    // CustomFind: find,
    sort: { _id: -1 },
    // populate: forcePopulate,
  };

  // User.find()
  //   .sort("_id")
  User.paginate({}, options, async (error, users, total) => {
    if (error || !users) {
      return res.status(404).send({
        status: "error",
        message: "No users available",
        error,
      });
    }

    const followUserId = await followService.followUserIds(req.user.id);
    //retornar el resultat
    return res.status(200).send({
      status: "success",
      users,
      page,
      itemsPerPage,
      total,
      user_following: followUserId.following,
      user_follow_me: followUserId.followers,
    });
  });
};

const update = async (req, res) => {
  //recollir info de l'usuari a actualitzar
  const userIdentity = req.user;
  const userToUpdate = req.body;
  console.log("heeloo");
  //eliminar camps sobrants
  delete userToUpdate.iat;
  delete userToUpdate.exp;
  delete userToUpdate.role;
  delete userToUpdate.image;

  //comprobar si l'usuari existeix
  try {
    //control usuaris duplicats
    const findUserAlreadyExist = await User.find({
      $or: [
        { email: userToUpdate.email.toLowerCase() },
        { nick: userToUpdate.nick.toLowerCase() },
      ],
    });

    let isUserSet = false;
    findUserAlreadyExist.forEach((user) => {
      if (user && user._id != userIdentity.id) isUserSet = true;
    });

    //el que volem actualitzar es l'usuari identificat per token...
    if (isUserSet) {
      return res.status(200).send({
        status: "success",
        message: "the user already exists",
      });
    }

    //xifrar contrasenya
    if (userToUpdate.password) {
      const pwd = await bCrypt.hash(userToUpdate.password, 10);
      userToUpdate.password = pwd;
    } else {
      delete userToUpdate.password;
      //fem el delete per que després en el findById no sobreescrigui la constrasenya!
    }

    //buscar i actualitzar
    const findByIdAndUpdate = await user.findByIdAndUpdate(
      { _id: userIdentity.id },
      userToUpdate,
      { new: true }
    );

    if (!findByIdAndUpdate) {
      return res.status(500).send({
        status: "error",
        message: "error updating the user" + error,
      });
    }

    return res.status(200).send({
      status: "success",
      message: "user updated...",
      user: findByIdAndUpdate,
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "error in the users query" + error,
    });
  }
};

const upload = async (req, res) => {
  try {
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

    //si tot es correcte guardar la imatge a la bd
    // console.log(req.user.id);
    // // const filter = { id: req.user.id };
    // console.log(req.params.id);
    // console.log(req.file.filename);
    // console.log(req);
    const userUpdated = await User.findOneAndUpdate(
      // req.user.id,
      { _id: req.user.id },
      { image: req.file.filename },
      { new: true }
    );

    if (!userUpdated) {
      return res.status(400).send({
        status: "error",
        message: "error finding/uploading the file",
      });
    }

    //retornar resposta
    return res.status(200).send({
      status: "success",
      user: userUpdated,
      file: req.file,
    });
  } catch (error) {
    return res.status(400).send({
      status: "error",
      message: "error uploading the file" + error,
    });
  }
};

const avatar = (req, res) => {
  //treure el parametre de la url
  const file = req.params.file;
  //montar el path real de la imatge
  const filePath = "./uploads/avatars/" + file;
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

const counters = async (req, res) => {
  let userId = req.user.id;
  if (req.params.id) {
    userId = req.params.id;
  }

  try {
    const following = await Follow.count({ user: userId });
    const followed = await Follow.count({ followed: userId });
    const publications = await Publication.count({ user: userId });

    return res.status(200).send({
      userId,
      following,
      followed,
      publications,
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "error in counters",
      error,
    });
  }
};

//exportar accions
module.exports = {
  testUser,
  register,
  login,
  profile,
  list,
  update,
  upload,
  avatar,
  counters,
};
