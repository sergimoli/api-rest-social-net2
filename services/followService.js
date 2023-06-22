const Follow = require("../models/follow");

const followUserIds = async (identityUserId) => {
  try {
    //treure info seguiment
    const following = await Follow.find({ user: identityUserId }).select({
      followed: 1,
      _id: 0,
    });
    const followers = await Follow.find({ followed: identityUserId }).select({
      user: 1,
      _id: 0,
    });

    //processar array d'indentificadors
    let followingClean = [];
    following.forEach((follow) => {
      followingClean.push(follow.followed);
    });

    let followersClean = [];
    followers.forEach((follow) => {
      followersClean.push(follow.user);
    });

    return {
      following: followingClean,
      followers: followersClean,
    };
  } catch (error) {
    return {};
  }
};
const followThisUser = async (identityUserId, profileUserId) => {
  try {
    //treure info seguiment. jo el segueixo a ell? ell es followed?
    const following = await Follow.findOne({
      user: identityUserId,
      followed: profileUserId,
    });
    // .select({
    //   followed: 1,
    //   _id: 0,
    // });
    //ell es l'usuari que em segueix a mi?
    const follower = await Follow.findOne({
      user: profileUserId,
      followed: identityUserId,
    });
    // .select({
    //   user: 1,
    //   _id: 0,
    // });

    return {
      following,
      follower,
    };
  } catch (error) {
    return {};
  }
};
module.exports = {
  followUserIds,
  followThisUser,
};
