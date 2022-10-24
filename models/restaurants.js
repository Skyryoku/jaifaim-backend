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

  });
  
  const Restaurant = mongoose.model('restaurants', restaurantSchema);
  
  module.exports = Restaurant