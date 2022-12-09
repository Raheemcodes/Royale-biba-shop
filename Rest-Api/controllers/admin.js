const Product = require('../models/product');
const fs = require('fs');

const { validationResult } = require('express-validator');

exports.getProducts = async (req, res, next) => {
  try {
    const products = await Product.find();

    res.status(200).json({ message: 'Feched successfully!', products });
  } catch (err) {
    console.log(err);
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getProduct = async (req, res, next) => {
  try {
    const postId = req.params.postId;
    const product = await Product.findById(postId);

    res.status(200).json({ message: 'Feched successfully!', product });
  } catch (err) {
    console.log(err);
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.createProduct = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const error = new Error(errors.array()[0].msg);
      error.statusCode = 422;
      throw error;
    }

    if (!req.file) {
      const error = new Error('No image provided.');
      error.statusCode = 422;
      throw error;
    }

    let imageUrl = req.file.path;
    const title = req.body.title;
    const price = req.body.price;
    // const description = req.body.description;
    const product = new Product({
      title,
      imageUrl,
      price,
    });
    await product.save();
    const prod = await Product.findOne({ imageUrl: imageUrl });
    res.status(200).json({ message: 'Product Created!', product: prod });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.editProduct = async function (req, res, next) {
  try {
    const prodId = req.body.productId;
    const updatedTitle = req.body.title;
    const updatedPrice = req.body.price;
    const image = req.file;
    console.log(prodId);
    // const updatedDesc = req.body.description;

    const product = await Product.findById(prodId);
    product.title = updatedTitle;
    product.price = updatedPrice;
    // product.description = updatedDesc;
    if (image) {
      clearImage(product.imageUrl);
      product.imageUrl = `${req.protocol}://${req.get('host')}/${image.path}`;
    }
    await product.save();
    const prod = await Product.findById(prodId);
    res.status(200).json({ message: 'Product Updated!', product: prod });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.deleteProduct = async function (req, res, next) {
  try {
    const prodId = req.params.productId;

    const product = await Product.findById(prodId);
    if (!product) {
      return next(new Error('Product not found.'));
    }
    clearImage(product.imageUrl);
    await Product.findByIdAndDelete(prodId);
    res.status(200).json({ message: 'Deleted post.' });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

const clearImage = (filePath) => {
  const file = filePath.replace(`http://localhost:5000/`, '');
  fs.unlink(file, (err) => {
    if (err) {
      throw err;
    }
  });
};
