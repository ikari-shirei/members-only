const mongoose = require('mongoose')

const Schema = mongoose.Schema

const MessageSchema = new Schema({
  title: { type: String, required: true, minlength: 1, maxLength: 20 },
  text: { type: String, required: true, minlength: 1, maxLength: 500 },
  timestamp: { type: Date, default: Date.now },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
})

// Url
MessageSchema.virtual('url').get(function () {
  return '/message/' + this._id
})

module.exports = mongoose.model('Message', MessageSchema)
