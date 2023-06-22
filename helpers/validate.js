const validator = require("validator");

const validateArticle = (parameters) => {
  let validate_title =
    !validator.isEmpty(parameters.title) &&
    validator.isLength(parameters.title, { min: 1, max: undefined });
  let validate_content = !validator.isEmpty(parameters.content);

  if (!validate_title || !validate_content) {
    throw new Error("the info has not validated");
  }
};

module.exports = { validateArticle };
