const mongoose = require('mongoose');

const platsdujourSchema = mongoose.Schema({
    name: String,
    description: String,
    src: String,
    date: Date,
    diets: String,
});

const restaurantSchema = mongoose.Schema({
    username: String,
    email: String,
    name: String,
    address: String,
    siren: String,
    website: String,
    phone: String,
    platsdujour: platsdujourSchema,
    cuisine: String,
    atmosphere: String,
    bookings: String,
    miscellaneous: String,
    bioShort: String,
    bioLong: String,
    socials: Object,
    goals: String,
    qrcode: Object,
  });
  
  const Restaurant = mongoose.model('restaurants', restaurantSchema);
  
  module.exports = Restaurant