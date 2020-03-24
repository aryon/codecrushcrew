const mongoose = require( 'mongoose' );
const schema = mongoose.Schema;

var UserSchema = new schema( {
  email: {
    type: String,
  },
}, {
  timestamps: true
} );

module.exports = mongoose.model( "User", UserSchema );
