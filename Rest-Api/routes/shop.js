const express = require('express');
const isAuth = require('../middleware/is-auth');

const shopController = require('../controllers/shop');

const router = express.Router();

router.get('/products', shopController.getProducts);

router.get('/new-in', shopController.getNewProducts);

router.get('/bag', isAuth, shopController.getBag);

router.get('/orders', isAuth, shopController.getOrders);

router.get('/checkout/:userId', shopController.checkout);

router.get('/orders/:orderId', isAuth, shopController.getInvoice);

router.post('/bag', isAuth, shopController.postBag);

router.post('/purchase-product', isAuth, shopController.purchaseProduct);

router.delete('/bag', isAuth, shopController.deleteBag);

// router.delete('/bag/:productId', isAuth, shopController.deleteBag);

module.exports = router;
