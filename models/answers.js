const mongoose = require('mongoose');

const answerSchema = mongoose.Schema({
    question: [{ type: mongoose.Schema.Types.ObjectId, ref: 'questions' }],
    date: Date,
    message: String,
});

const Answer = mongoose.model('answers', answerSchema);

module.exports = Answer;