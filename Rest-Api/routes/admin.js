const express = require('express');

const { body } = require('express-validator');

const adminControllers = require('../controllers/admin');

const isAuth = require('../middleware/is-auth');
const isAdmin = require('../middleware/is-admin');

const router = express.Router();

router.get('/products', isAuth, isAdmin, adminControllers.getProducts);

router.get('/products/:postId', isAuth, isAdmin, adminControllers.getProduct);

router.post(
  '/create-post',
  isAuth,
  isAdmin,
  [
    body('title', 'INVALID_TITLE').trim().not().isEmpty(),
    body('price', 'INVALID_PRICE').trim().not().isEmpty(),
  ],
  adminControllers.createProduct,
);

router.put('/edit-post', isAuth, isAdmin, adminControllers.editProduct);

router.delete(
  '/delete-post/:productId',
  isAuth,
  isAdmin,
  adminControllers.deleteProduct,
);

module.exports = router;
