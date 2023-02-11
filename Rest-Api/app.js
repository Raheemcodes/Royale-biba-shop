const path = require('path');
const fs = require('fs');

const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');

const authRoutes = require('./routes/auth');
const shopRoutes = require('./routes/shop');
const adminRoutes = require('./routes/admin');
const { default: helmet } = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

const app = express();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now().toString() + '-' + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, 'access.log'),
  { flags: 'a' }
);

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

app.use(compression());
app.use(morgan('combined', { stream: accessLogStream }));

express.urlencoded({ extended: true });
app.use(express.json()); // application/json
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
);
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.ACCESS_ORIGIN);
  res.setHeader(
    'Access-Control-Allow-Methods',
    'OPTIONS, GET, POST, PUT, PATCH, DELETE'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use(authRoutes);
app.use(shopRoutes);
app.use('/admin', adminRoutes);

app.use((error, req, res, next) => {
  const status = error.statusCode || 500;
  const message = error.message;
  console.log(error.message);
  res.status(status).json({ message });
});

mongoose
  .set('strictQuery', false)
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.u4041.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}`
  )
  .then(() => {
    console.log('Database connected');

    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server listening at port: ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => console.log(err));
