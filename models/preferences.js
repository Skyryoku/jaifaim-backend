const mongoose = require('mongoose');

const preferenceSchema = mongoose.Schema({
  cuisine: String,
  atmosphere: String,
  diete: String,
  intolerances: String,
  profilGourmand: String,
  bookings: String,
  miscellaneous: String,
});

const Preference = mongoose.model('preferences', preferenceSchema);

module.exports = Preference;