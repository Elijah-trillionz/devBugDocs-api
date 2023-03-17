const mongoose = require("mongoose");

const UsersSchema = new mongoose.Schema({
  name: "String",
  id: "String",
  imgUri: "String",
  createdAt: {
    type: Date,
    default: Date.now,
  },
  hearts: {
    type: Array,
  },
});

module.exports = mongoose.model("Users", UsersSchema);
