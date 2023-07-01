const mongoose = require('mongoose')

const questionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true,
        unique:true
    },
    date: {
        type: Date,
        default: Date.now()
    }
});

const Questions = new mongoose.model('Question', questionSchema);

module.exports = Questions

