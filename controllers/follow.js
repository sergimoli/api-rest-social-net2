const Follow = require("../models/follow");
const User = require("../models/user");

//importar servei
const followService = require("../services/followService");

const testFollow = (req, res) => {
  return res.status(200).send({
    message: "message sent from: controllers/follow.js",
  });
};

//accoçp de guardar  un follow(acció de seguir)
const save = async (req, res) => {
  try {
    //conseguir dades per body
    const params = req.body;

    //treure id del susuari identificat
    const identity = req.user;
    //crear objecte amb model follow
    const userToFollow = new Follow({
      user: identity.id,
      //identity.id = payload del token. A la base de dades es guarda tot amb '_id'
      followed: params.followed,
    });

    //guardar objecte de bddd
    const saveUserToFollow = await userToFollow.save();
    if (!saveUserToFollow) {
      return res.status(500).send({
        status: "error",
        message: "it was not able to follow the user",
      });
    }

    return res.status(200).send({
      status: "success",
      identity,
      saveUserToFollow,
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "error following the user",
    });
  }
};
//acció de borrar un follow (deixar de sguir)
const unfollow = async (req, res) => {
  try {
    //recollir el id de l'suaari identificat
    const userId = req.user.id;
    //reccolir el id del usuari que segeuixo i vull deixar de seguir
    const followedId = req.params.id;

    const findFollow = await Follow.find({
      user: userId,
      followed: followedId,
    });
    if (!findFollow) {
      return res.status(500).send({
        status: "error",
        message: "error finding to delete the followed",
      });
    }

    const deleteFollow = await Follow.deleteOne({
      user: userId,
      followed: followedId,
    });

    if (!deleteFollow) {
      return res.status(500).send({
        status: "error",
        message: "error deleting the followed" + error,
      });
    }

    return res.status(200).send({
      status: "success",
      message: "follow deleted succesfully",
      // identity: req.user,
      // findFollow,
      // deleteFollow,
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      error,
      message: "error unfollowing the user",
    });
  }
};

//acció llistat qualsevol usuari està seguint (SEGUINT)
const following = (req, res) => {
  // try {
  //treure el id de l'usuari identificat
  let userId = req.user.id;

  //comprobar si m'arriba el id per paràmetre en url
  if (req.params.id) userId = req.params.id; //l'usuari que arribi per la url tindrà més prioritat

  //comporobar si m'arriba la pàgina, sino, la pàgina 1
  let page = 1;
  if (req.params.page) page = req.params.page;

  //usuaris per pàgina
  const itemPerPage = 5;

  //find a follow, popular dades dels usuaris i paginar amb mongoose paginate.
  // const follows = await Follow.find({ user: userId }).populate(
  //   "user followed",
  //   "-password -role -__v"
  // ); //usuari que està seguint a altres
  const query = { user: userId };
  const forcePopulate = {
    path: "user followed",
    select: "-password -role -__v -email",
  };
  const options = {
    page: page,
    limit: itemPerPage,
    populate: forcePopulate,
    // populate: "user followed",
  };

  Follow.paginate(query, options, async (error, follows, total) => {
    const followUserId = await followService.followUserIds(req.user.id);

    return res.status(200).send({
      status: "success",
      message: "list of users i'm following",
      follows,
      total,
      user_following: followUserId.following,
      user_follow_me: followUserId.followers,
    });
  });

  //llistat d'usuaris de trinity, i soc sergi,
  //treure uun array dels ids dels usuaris que em segueixen i els que segueixo com a sergi

  // } catch (error) {
  //   return res.status(500).send({
  //     status: "error",
  //   });
};

//acció llistat d'usuaris que segueixen a qualsevol altre usuari. (ESTIC SENT SEGUIT)
const followers = (req, res) => {
  // try {
  //treure el id de l'usuari identificat
  let userId = req.user.id;

  //comprobar si m'arriba el id per paràmetre en url
  if (req.params.id) userId = req.params.id; //l'usuari que arribi per la url tindrà més prioritat

  //comporobar si m'arriba la pàgina, sino, la pàgina 1
  let page = 1;
  if (req.params.page) page = req.params.page;

  //usuaris per pàgina
  const itemPerPage = 5;

  const query = { followed: userId };
  const forcePopulate = {
    path: "user",
    select: "-password -role -__v -email",
  };
  const options = {
    page: page,
    limit: itemPerPage,
    populate: forcePopulate,
    // populate: "user followed",
  };

  Follow.paginate(query, options, async (error, follows, total) => {
    const followUserId = await followService.followUserIds(req.user.id);

    return res.status(200).send({
      status: "success",
      message: "list of users are following to me",
      follows,
      total,
      user_following: followUserId.following,
      user_follow_me: followUserId.followers,
    });
  });
};

//exportar accions
module.exports = {
  testFollow,
  save,
  unfollow,
  following,
  followers,
};
