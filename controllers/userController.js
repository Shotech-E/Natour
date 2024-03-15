const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.getAllUsers = catchAsync(async (req, res, next) => {
	const users = await User.find();

	//SEND RESPONSE
	res.status(200).json({
		status: 'success',
		results: users.length,
		data: {
			users,
		},
	});
});

exports.updateMe = catchAsync(async(req, res, next) => { 
	// Create error if user posts password data
	if (req.body.password || req.body.passwordConfirm) {
		return next(
			new AppError(
				'Thisroute is not for password update, please use /updateMyPassword.',
				400
			)
		);
	}

	// Update user document
	const UpdatedUser = await User.findByIdAndUpdate(req.user.id, x, {
		new: true, runValidators: true
	});
	
	res.status(200).json({
		status: 'success'
	});
})

exports.getUser = (req, res) => {
	res.status(500).json({
		status: 'success',
		message: 'This route is not defined!',
	});
};

exports.createUser = (req, res) => {
	res.status(500).json({
		status: 'success',
		message: 'This route is not defined!',
	});
};

exports.updateUser = (req, res) => {
	res.status(500).json({
		status: 'success',
		message: 'This route is not defined!',
	});
};

exports.deleteUser = (req, res) => {
	res.status(500).json({
		status: 'success',
		message: 'This route is not defined!',
	});
};
