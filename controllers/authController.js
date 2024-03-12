const {promisify} = require('util');
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
exports.signup = catchAsync(async (req, res, next) => {
	const newUser = await User.create(req.body);

	const token = signToken(newUser._id);

	res.status(201).json({
		status: 'success',
		token,
		data: {
			user: newUser,
		},
	});
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
	const token = signToken(user._id);
	res.status(200).json({
		status: 'success',
		token,
	});
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

	//check if the user exits ////////////////////////////////////////////////////////
	const currentUser = User.findById(decoded.id);//////////////////////
	if (!currentUser) {
		return next(new AppError('The user belong to this token was not found', 401));
	}

	//check if user changed password after the token was issued
	if(currentUser.changedpasswordAfter(decoded.id)){
		return next(new AppError('User recently changed password! Please login again', 401));
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
	await user.save();
});

//Send it to user's email address
const resetURL

exports.resetPassword = (req, res, next) => { };