const mongoose = require('mongoose');

const addressSchema = mongoose.Schema({
  streetNumber: String,
  streetType: String,
  streetName: String,
  postCode: Number,
  city: String,
});

const platdujourSchema = mongoose.Schema({
  name: String,
  description: String,
  src: String,
  date: Date,
  diets: [String],
});

const restaurantSchema = mongoose.Schema({
  username: String,
  email: String,
  name: String,
  password: String,
  token: String,
  address: addressSchema,
  siren: String,
  website: String,
  phone: String,
  platsdujour: [platdujourSchema],
  cuisine: [String],
  atmosphere: [String],
  bookings: String,
  miscellaneous: [String],
  bioShort: String,
  bioLong: String,
  socials: Object,
  goals: [String],
  qrcode: Object,
});

const Restaurant = mongoose.model('restaurants', restaurantSchema);

module.exports = Restaurant;
