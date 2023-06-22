const { Schema, model } = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
// const mongoosePaginate = require("mongoose-paginate");
const userSchema = Schema({
  name: {
    type: String,
    required: true,
  },
  surname: {
    type: String,
    required: true,
  },
  // bio: String,
  bio: {
    type: String,
  },
  nick: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: "role_user",
  },
  image: {
    type: String,
    default: "default.png",
  },
  create_at: {
    type: Date,
    default: Date.now,
  },
});
userSchema.plugin(mongoosePaginate);

module.exports = model("User", userSchema, "users");
// A comentar. si no li posem el tercer paràmetre ja m'ho posaria com a users doncs la primera lletra te la posa en minúscula i t'ho posa en plurarl. Si ho poso es per estar segur...
