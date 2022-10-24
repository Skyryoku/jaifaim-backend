const mongoose = require('mongoose');

const questionSchema = mongoose.Schema({

    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    restaurants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'restaurants' }],
    date: Date,
    token: String,
    message: String,

});

const Question = mongoose.model('questions', questionSchema);

module.exports = Question;