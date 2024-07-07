const mongoose = require('mongoose');

const authorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  books: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }],
  description: { type: String },
  dateOfBirth: {
    type: Date,
    validate: {
      validator: function (value) {
        return value < new Date();
      },
    },
  },
  country: { type: String }
});

module.exports = mongoose.model('Author', authorSchema);
