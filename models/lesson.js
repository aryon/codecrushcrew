const mongoose = require( 'mongoose' );
const schema = mongoose.Schema;

var LessonSchema = new schema( {
  title: {
    type: String,
  },
  description: {
    type: String,
  },
  url: {
    type: String,
  },
  sort: {
    type: Number,
    default: 0
  },
}, {
  timestamps: true
} );

module.exports = mongoose.model( "Lesson", LessonSchema );
