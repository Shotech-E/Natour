const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

const filterObj = (obj, ...allowedFields) => {
	const newObj = {};
	Object.keys(obj).forEach(el => {
		if (allowedFields.includes(el)) newObj[el] = obj[el];
	});
	return newObj;
}

exports.getMe = (req, res, next) => {
	req.params.id = req.params.id;
	next();
};

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



exports.createUser = (req, res) => {
	res.status(500).json({
		status: 'success',
		message: 'This route is not defined! Please use signup instead'
	});
};

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);

//Do Not Update Passwords with this!
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);