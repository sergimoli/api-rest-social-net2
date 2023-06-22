//importar dependències/modules
const jwt = require("jwt-simple");
const moment = require("moment");
//importar clau secreta
const libjwt = require("../services/jwt");
const secret = libjwt.secret;
//funció de autenticació
//req(request) res(response) next(passar al seguent acció que està aplicada el middleware)
//MIDDLEWARE(s'executa al mig d'algo) D'AUTENTICACIÓ
exports.auth = (req, res, next) => {
  //comprobar si arriba la capçalera d'autenticació
  if (!req.headers.authorization) {
    return res.status(403).send({
      status: "error",
      message: "the header of the petition does not appear",
    });
  }

  //netejar el token. el que fem es mitjançant una expressió regular treiem els valors comenta simple (') i cometa doble('') i ho hreemplacem amb res.
  let token = req.headers.authorization.replace(/['"]+/g, "");
  //decodificar el token
  try {
    let payload = jwt.decode(token, secret);
    //comprobar expiració del token
    if (payload.exp <= moment().unix()) {
      return res.status(401).send({
        status: "error",
        message: "expired token",
      });
    }

    //afegir dades d'usuari a la request!!
    req.user = payload;
  } catch (error) {
    return res.status(404).send({
      status: "error",
      message: "invalid token",
      error,
    });
  }

  //passar a execuió de l'acció (que seria la del controlador)
  next();
};
