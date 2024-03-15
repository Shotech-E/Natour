const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/email');

const signToken = (id) => {
	return jwt.sign({ id }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRES_IN,
	});
};

const createSendToken = (user, statusCode, res) => {
	const token = signToken(user._id);

	res.status(statusCode).json({
		status: 'success',
		token,
		data: {
			user
		},
	});

}

exports.signup = catchAsync(async (req, res, next) => {
	const newUser = await User.create(req.body);
	createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
	const { email, password } = req.body;

	// check if the email and password exist
	if (!email || !password) {
		return next(
			new AppError('Please provide a valid email and password!', 400)
		);
	}

	// check if the User exist and password is correct
	const user = await User.findOne({ email }).select('+password');

	if (!user || !(await user.correctPassword(password, user.password))) {
		return next(
			new AppError('Incorrect Email or Password! Please try again.', 401)
		);
	}

	// check if everything is ok and send token to client
	createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
	//Getting the token and check of it's there
	let token;
	if (req.headers.Authorization && req.headers.Authorization.startWith('Bearer')) {
		token = req.headers.Authorization.split(' ')[1];
	}
	console.log(token);

	if (!token) {
		return next(
			new AppError(
				'You are not authorized to access this route. Please logged in first.',
				401
			)
		);
	}

	//verification of token
	const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

	//check if the user exits 
	const currentUser = User.findById(decoded.id);
	if (!currentUser) {
		return next(
			new AppError(
				'The user belong to this token was not found',
				401
			)
		);
	}

	//check if user changed password after the token was issued
	if(currentUser.changedpasswordAfter(decoded.id)){///////
		return next(
			new AppError(
				'User recently changed password! Please login again',
				401
			)
		);
	}

	// GRNAT ACCESS TO PROTECTED ROUTE
	req.user = currentUser;
	next();
});

exports.restrictTo = (...roles) => {
	return (req, res, next) => {
		if (!roles.includes(req.user.role)) {
			return next(
				new AppError('You are not authorized to access this route', 403));
		}
		next();
	};
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
	// Get user based on posted email
	const user = await User.findOne({ email: req.body.email });
	if(!user) {
		return next(new AppError('There is no user with email address.', 404));
	}

	//Generate the random reset token
	const resetToken = user.createPassowrdResetToken;
	await user.save({ validateBeforeSave: false });

	//Send it to user's email address
	const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

	const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirmation to: ${resetURL}.\n if you didn't forget your password, please ignore this message`;

	try {

		await sendEmail({
			email: user.email,
			subject: 'Your password reset reset (valid for 10 mins)',
			message
		});
	
		res.status(200).json({
		status: 'success',
		message: 'Token sent to email!'
		});
		
	} catch (err) { 
		user.PassowrdResetToken = undefined;
		user.PassowrdResetExpires = undefined;
		await user.save({ validateBeforeSave: false });

		return next(new AppError('There was an error sending the email, Try again later!'), 500);

	}

});

exports.resetPassword = catchAsync(async(req, res, next)=> {
	// Get user based on the token
	const hashToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

	const user = await User.findOne({
		PassowrdResetToken: hashToken, PassowrdResetExpires: { $gt: Date.now() }
	});

	// if token has not expired, there is user, set the new password
	if (!user) {
		return next(new AppError('Token is invalid or has expired', 400))
	}
	user.password = req.body.password;
	user.passwordConfirm = req.body.password
	user.PassowrdResetToken = undefined;
	user.PassowrdResetExpires = undefined;
	await user.save();

	// update changedPassword field for the user


	// log the user in, and send JWT token
	createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async(req, res, next) => { 
	// Get user from collection
	const user = await User.findById(req.user.id).select('password');

	// check if posted current password is correct
	if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
		return next(new AppError('Your current password is wrong.', 401));
	}

	// if so, update password
	user.password = req.body.password;
	user.passwordConfirm = req.body.passwordConfirm;
	await user.save();

	// log the user in, send JWT
	createSendToken(user, 200, res);
});