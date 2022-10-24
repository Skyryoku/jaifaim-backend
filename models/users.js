const mongoose = require('mongoose');

const collectionSchema = mongoose.Schema({
  name: String,
  restaurants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'restaurants' }],
  isPublic: Boolean,
});

const collectionsSchema = mongoose.Schema({
  likes: collectionSchema,
  bookmarks: collectionSchema,
  visited: collectionSchema,
});

const userSchema = mongoose.Schema({
  username: String,
  email: String,
  firstname: String,
  collections: collectionsSchema,
  password: String,
  token: String,
  diets: [String],
  intolerances: [String],
  profilGourmand: String,
  badges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'badges' }],
});

const User = mongoose.model('users', userSchema);

module.exports = User;