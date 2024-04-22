const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

// const {getAllUsers, createUser, getUser, updateUser, deleteUser} = require('./../controllers/userController');

const router = express.Router();

// To protect routes from Unauthorized Users after this middleware
router.use(authController.protect);

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

// To protect routes from Unauthorized Users after this middleware
router.use(authController.restrictTo('admin'));

router.patch('/updateMyPassword', authController.updatePassword);

router.get('/me', userController.getMe, userController.getUser);

router.patch('/updateMe', userController.updateMe);
router.delete('/deleteMe', userController.deleteMe);

router
	.route('/')
	.get(userController.getAllUsers)
	.post(userController.createUser);

router
	.route('/:id')
	.get(userController.getUser)
	.patch(userController.updateUser)
	.delete(userController.deleteUser);

module.exports = router;