// const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { OAuth2Client } = require('google-auth-library');

const nodemailer = require('nodemailer');
const { validationResult } = require('express-validator');

const User = require('../models/user');

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
const FRONTEND_ADDRESS = process.env.FRONTEND_ADDRESS;

const client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

client.setCredentials({ refresh_token: REFRESH_TOKEN });

async function sendMail(email, subject, mail) {
  try {
    const accessToken = await client.getAccessToken();
    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.NODEMAIL_GMAIL,
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken,
      },
    });

    await transport.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject,
      generateTextFromHTML: true,
      html: mail,
    });
  } catch (err) {
    console.log(err);
    throw err;
  }
}

exports.signup = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const error = new Error(errors.array()[0].msg);
      error.statusCode = 422;
      throw error;
    }

    const email = req.body.email;
    const name = req.body.fullName;
    const password = req.body.password;

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({
      email: email,
      name: name,
      password: hashedPassword,
      cart: { items: [] },
    });

    await user.save();

    res.status(200).json({ message: 'Signup successful!', userId: user._id });

    await sendMail(
      email,
      'Sign up suceeded!',
      `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap" rel="stylesheet">
      <title>Document</title>
      <style>
        body {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          width: 100%;
          height: 100%;
        }
        h1 {
          font-family: 'Montserrat', sans-serif;
          font-size: 3rem;
        }
        a,
        a:visited,
        a:focus,
        a:hover,
        a:active {
          border-radius: 5px;
          background-color: #ff66cc;
          color: white !important;
          padding: 0.5rem 1rem;
          text-align: center;
          font-weight: bold;
          font-size: 1.5rem;
          font-family: 'Montserrat', sans-serif;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
    <h1>You successfully signed up!</h1>
    <a href="${FRONTEND_ADDRESS}/auth">Login</a>
    </body>
    </html>
    `
    );
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const error = new Error(errors.array()[0].msg);
      error.statusCode = 422;
      throw error;
    }

    const email = req.body.email;
    const password = req.body.password;
    let loadedUser;

    const user = await User.findOne({ email: email });
    if (!user) {
      const error = new Error('Email not found');
      error.statusCode = 401;
      throw error;
    }
    loadedUser = user;
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      const error = new Error('Wrong password!');
      error.statusCode = 401;
      throw error;
    }
    const token = jwt.sign(
      {
        email: loadedUser.email,
        userId: loadedUser._id.toString(),
      },
      'somesuperraheemsecret',
      { expiresIn: '2h' }
    );
    res.status(200).json({
      email: loadedUser.email,
      name: loadedUser.name,
      id: loadedUser._id.toString(),
      isAdmin: loadedUser.admin || false,
      token: token,
      expiresIn: 7200,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.googleAuth = async (req, res, next) => {
  try {
    const id_token = req.body.idToken;
    // const { tokens } = await client.getToken(code);

    // const id_token = tokens.id_token;

    const ticket = await client.verifyIdToken({
      idToken: id_token,
      audience: CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const password = payload.sub;
    // console.log(payload)
    console.log(password);
    const user = await User.findOne({ email: payload.email });
    if (!user) {
      const hashedPassword = await bcrypt.hash(password, 12);
      const user = new User({
        email: payload.email,
        name: payload.name,
        password: hashedPassword,
        cart: { items: [] },
      });
      await user.save();
    } else {
      const isEqual = await bcrypt.compare(password, user.password);
      if (!isEqual) {
        const error = new Error('Wrong password!');
        error.statusCode = 401;
        throw error;
      }
    }

    const loadedUser = await User.findOne({ email: payload.email });

    const token = jwt.sign(
      {
        email: payload.email,
        userId: loadedUser._id,
      },
      'somesuperraheemsecret',
      { expiresIn: '2d' }
    );
    res.status(200).json({
      email: loadedUser.email,
      name: loadedUser.name,
      id: loadedUser._id.toString(),
      isAdmin: loadedUser.admin || false || false,
      token: token,
      expiresIn: 7200,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
