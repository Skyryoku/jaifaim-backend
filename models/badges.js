const mongoose = require('mongoose');

const badgeSchema = mongoose.Schema({

    name: String,
    restaurants: { type: mongoose.Schema.Types.ObjectId, ref: 'restaurants'},
    source: String
    
  });
  
  const Badge = mongoose.model('badges', badgeSchema);
  
  module.exports = Badge;