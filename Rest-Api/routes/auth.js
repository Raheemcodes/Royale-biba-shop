const express = require('express');

const User = require('../models/user');

const { check, body } = require('express-validator');

const authController = require('../controllers/auth');

const router = express.Router();

router.post(
  '/signup',
  [
    check('email')
      .isEmail()
      .withMessage('Please enter a valid email')
      .normalizeEmail()
      .custom(async (value, { req }) => {      
        const userDoc = await User.findOne({ email: value });
        if (userDoc) {
          return Promise.reject('E-mail already exist!');
        }
        return userDoc;
      }),
    body('fullName', 'Enter Full Name').trim().not().isEmpty(),
    body('password', 'Password not strong').trim().isStrongPassword(),
    body('confirmPassword').custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords have to match');
      }
      return true;
    }),
  ],
  authController.signup,
);

router.post(
  '/login',
  [
    check('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please enter a valid email'),
    body('password', 'Password has to be valid').trim().not().isEmpty(),
  ],
  authController.login,
);

// router.get('/google-auth/signup', authController.getGoogleAuth);

router.post('/google-auth', authController.googleAuth);

module.exports = router;
