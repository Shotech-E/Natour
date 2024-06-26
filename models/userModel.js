const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const { Schema } = mongoose;

const userSchema = new Schema({
	name: {
		type: String,
		required: [true, 'Please tell us your name!'],
	},
	email: {
		type: String,
		required: [true, 'Please tell us your email!'],
		unique: true,
		lowercase: true,
		validate: [validator.isEmail, 'Please provide a valid email address'],
	},
	photo: String,

	role: {
		type: String,
		enum: ['user', 'guide', 'lead-guide', 'admin'],
		default: 'user'
	},

	password: {
		type: String,
		required: [true, 'Please provide a password'],
		minlength: 8,
		select: false,
	},
	passwordConfirm: {
		type: String,
		// required: [true, 'Please confirm your password'],
		validate: {
			//THIS ONLY WORKS ON CREATE OR SAVE!!!
			validator: function (el) {
				return el === this.password;
			},
			message: 'Passwords are not the same!'
		}
	},
	passwordChangeAt: Date,
	passwordResetToken: String,
	passwordResetExpires: Date,
	active: {
		type: 'boolean',
		default: true,
		select: false
	}
});

userSchema.pre('save', async function (next) {
	// Only run this function if the password was actually  modified
	if (!this.isModified('password')) return next();

	// Hash the password with cost of 12
	this.password = await bcrypt.hash(this.password, 12);

	// Delete the passwordConfirm field
	this.passwordConfirm = undefined;
	next();
});

userSchema.pre('save', function (next) {
	if (!this.isModified('password') || this.isNew) return next();
	
	this.changePasswordAt = Date.now() - 1000;
	next();
});

userSchema.pre(/^find/, function (next) {
	// this points to the current query
	this.find({ active: {$ne: false} });
	next();
});

userSchema.methods.correctPassword = async function (
	candidatePassword,
	userPassword
) {
	return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changePasswordAfter = function (JWTTimestamp) {
	if (this.passwordChangeAt) {

		const changeTimestamp = parseInt(this.passwordChangeAt.getTime()/ 1000, 10);

		return JWTTimestamp < changeTimestamp;
	}

	//false means not changed
	return false;
}

userSchema.methods.createPasswordResetToken = function () {
	const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

	console.log({resetToken}, this.passwordResetToken)
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
}

const User = mongoose.model('User', userSchema);

module.exports = User;
