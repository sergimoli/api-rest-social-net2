//importar dependències
const jwt = require("jwt-simple");
const moment = require("moment");

//clau secreta per generar el token
const secret = "KEY_SECRET_PROJECT_SOCIAL_NET_baldufa2023";
//crear funció per generar tokens
const crateToken = (user) => {
  const payload = {
    id: user._id,
    name: user.name,
    surname: user.surname,
    nick: user.nick,
    email: user.email,
    role: user.role,
    image: user.image,
    iat: moment().unix(),
    exp: moment().add(30, "days").unix(),
  };
  //retornar jwt token codificat
  return jwt.encode(payload, secret);
};

module.exports = {
  secret,
  crateToken,
};
