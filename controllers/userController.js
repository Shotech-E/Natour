const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

const filterObj = (obj, ...allowedFields) => {
	const newObj = {};
	Object.keys(obj).forEach(el => {
		if (allowedFields.includes(el)) newObj[el] = obj[el];
	});
	return newObj;
}


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

exports.updateMe = catchAsync(async (req, res, next) => {
	// Create error if user posts password data
	if (req.body.password || req.body.passwordConfirm) {
		return next(
			new AppError(
				'This route is not for password update, please use /updateMyPassword.',
				400
			)
		);
	}

	// Filtered out unwanted fields names that are not allowed to be changed or updated.
	const filterBody = filterObj(req.body, 'name', 'email');

	// Update user document
	const UpdatedUser = await User.findByIdAndUpdate(req.user.id, x, {
		new: true, runValidators: true
	});
	
	res.status(200).json({
		status: 'success',
		data: {
			user: UpdatedUser
		}
	});
});

exports.deleteMe = catchAsync(async (req, res, next) => {
	await User.findByIdAndUpdate(req.user.id, { active: false });

	res.status(204).json({
		status: 'success',
		data: null
	});
});

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
