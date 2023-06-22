const mongoose = require("mongoose");
const connect = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/my_social_net");
    console.log("correctly connected to the bd: my_social_net");
  } catch (error) {
    console.log(error);
    throw new Error("cannot be connected to the db!");
  }
};
module.exports = connect;
