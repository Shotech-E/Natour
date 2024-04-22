"use strict";

var User = require('./../models/userModel');

var catchAsync = require('./../utils/catchAsync');

var AppError = require('./../utils/appError');

var factory = require('./handlerFactory');

var filterObj = function filterObj(obj) {
  for (var _len = arguments.length, allowedFields = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    allowedFields[_key - 1] = arguments[_key];
  }

  var newObj = {};
  Object.keys(obj).forEach(function (el) {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getAllUsers = catchAsync(function _callee(req, res, next) {
  var users;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return regeneratorRuntime.awrap(User.find());

        case 2:
          users = _context.sent;
          //SEND RESPONSE
          res.status(200).json({
            status: 'success',
            results: users.length,
            data: {
              users: users
            }
          });

        case 4:
        case "end":
          return _context.stop();
      }
    }
  });
});
exports.updateMe = catchAsync(function _callee2(req, res, next) {
  var filterBody, UpdatedUser;
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          if (!(req.body.password || req.body.passwordConfirm)) {
            _context2.next = 2;
            break;
          }

          return _context2.abrupt("return", next(new AppError('This route is not for password update, please use /updateMyPassword.', 400)));

        case 2:
          // Filtered out unwanted fields names that are not allowed to be changed or updated.
          filterBody = filterObj(req.body, 'name', 'email'); // Update user document

          _context2.next = 5;
          return regeneratorRuntime.awrap(User.findByIdAndUpdate(req.user.id, x, {
            "new": true,
            runValidators: true
          }));

        case 5:
          UpdatedUser = _context2.sent;
          res.status(200).json({
            status: 'success',
            data: {
              user: UpdatedUser
            }
          });

        case 7:
        case "end":
          return _context2.stop();
      }
    }
  });
});
exports.deleteMe = catchAsync(function _callee3(req, res, next) {
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.next = 2;
          return regeneratorRuntime.awrap(User.findByIdAndUpdate(req.user.id, {
            active: false
          }));

        case 2:
          res.status(204).json({
            status: 'success',
            data: null
          });

        case 3:
        case "end":
          return _context3.stop();
      }
    }
  });
});

exports.getUser = function (req, res) {
  res.status(500).json({
    status: 'success',
    message: 'This route is not defined!'
  });
};

exports.createUser = function (req, res) {
  res.status(500).json({
    status: 'success',
    message: 'This route is not defined!'
  });
}; //Do Not Update Passwords with this!


exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);