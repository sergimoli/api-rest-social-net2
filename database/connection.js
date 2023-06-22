//importar mongoose
const mongoose = require("mongoose"); //el require es per importar dependències
const conexion = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/my_blog");
    console.log("we are connected to the my_blog db!");
  } catch (error) {
    console.log(error);
    throw new Error("it was not possible to connect to the db.");
  }
};

module.exports = {
  conexion,
};
