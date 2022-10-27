const mongoose = require('mongoose');

const preferenceSchema = mongoose.Schema({
  atmosphere: [String],
  bookings: [String],
  cuisine: [String],
  diets: [{ name: String, description: String }],
  intolerances: [String],
  miscellaneous: [String],
  profilGourmand: [String],
});

const Preference = mongoose.model('preferences', preferenceSchema);

module.exports = Preference;
