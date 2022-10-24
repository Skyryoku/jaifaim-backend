const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  username: String,
  email: String,
  firstname: String,
  password: String,
  token: String,
  diets: String,
  intolerances: String,
  profilGourmand: String,
  badges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'badges'}],
  
});

const User = mongoose.model('users', userSchema);

module.exports = User;