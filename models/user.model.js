
const config = require('config');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const mongoose = require('mongoose');

//simple schema
const UserSchema = new mongoose.Schema({
	username: {
		type: String,
		required: true,
		minlength: 3,
		maxlength: 50
	},
	email: {
		type: String,
		required: true,
		minlength: 5,
		maxlength: 255,
		unique: true
	},
	password: {
		type: String,
		required: true,
		minlength: 3,
		maxlength: 255
	},
	lid: {
		type: Number,
		required: true,
		unique: true
	},
	Admin: Boolean,
	User: Boolean,
	Validated: Boolean,
	Active: Boolean,
	comments: [{ body: String, date: Date }],
	date: { type: Date, default: Date.now }
});


//custom method to generate authToken 
// UserSchema.methods.generateAuthToken = function() { 
  // const token = jwt.sign({ _id: this._id, isAdmin: this.isAdmin }, config.get('myprivatekey')); //get the private key from the config file -> environment variable
  // return token;
// }

// const User = mongoose.model('User', UserSchema);

// UserSchema.statics.loginUser = function(reqUsername,reqPassword) {
    // return this.find({ 'username': reqUsername, 'password' : reqPassword});
// };
// public static UserSchema.static("loginUser",function(reqUsername,reqPassword) {
    // return this.find({ 'username': reqUsername, 'password' : reqPassword});
// });

// var UserSchema2 = {
    // loginUser: function(reqUsername,reqPassword) {
		// return this.find({ 'username': reqUsername, 'password' : reqPassword});
	// }
// }


// UserSchema.query.byNamePassword = function(username,password) {
    // return this.where({ 'username': username,'password': password});
  // };

// function validateUser(user) {
	// we may not use this !
  // const schema = {
    // name: Joi.string().min(3).max(50).required(),
    // email: Joi.string().min(5).max(255).required().email(),
    // password: Joi.string().min(3).max(255).required()
  // };
   // console.log("ma user is: "+user.name);
  // return Joi.validate(user, schema);
// }
// async function loginUser() = UserSchema.statics.loginUser();
// async function loginUserXXX(reqUsername,reqPassword) {
	// console.log("login %s p %s",reqUsername,reqPassword);
	// try {
		// const user = User.find({'username': reqUsername, 'password' : reqPassword});
		// if (!user) return;
		// const { password, ...userWithoutPassword } = user;
		// return userWithoutPassword;
	// } catch(ex) {
		// console.log("getById error %o",ex);
	// }
// }


// exports.User = User; 
// exports.validate = validateUser;
// exports.login = loginUser;


// module.exports = {
    // User
	// ,validateUser
	// ,loginUser
	// ,UserSchema
	// ,UserSchema2
	// ,byNamePassword
// };
