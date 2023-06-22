const validator = require("validator");

const validate = (params) => {
  //   console.log("hello isisisisi");
  let name =
    !validator.isEmpty(params.name) &&
    validator.isLength(params.name, { min: 3, max: undefined }) &&
    validator.isAlpha(params.name, "en-US");

  let surname =
    !validator.isEmpty(params.surname) &&
    validator.isLength(params.surname, { min: 3, max: undefined }) &&
    validator.isAlpha(params.surname, "en-US");

  let nick =
    !validator.isEmpty(params.nick) &&
    validator.isLength(params.nick, { min: 2, max: undefined });

  let email =
    !validator.isEmpty(params.email) && validator.isEmail(params.email);

  let password = !validator.isEmpty(params.password);

  if (params.bio) {
    let bio = validator.isLength(params.bio, { min: undefined, max: 255 });
    if (!bio) {
      throw new Error("validation not good...");
      //   console.log("nyecccc");
    } else {
      console.log("validation ooook!");
    }
  }

  if (!name || !surname || !nick || !email || !password) {
    throw new Error("validation not good...");
    // console.log("nyecccc");
  } else {
    console.log("validation ooook!");
  }
};

module.exports = validate;
