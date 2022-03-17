const fs = require('fs');
const path = require('path');

const Product = require('../models/product');
const User = require('../models/user');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const PDFDocument = require('pdfkit');

exports.purchaseProduct = async (req, res, next) =>  {
  try {
    const prodId = req.body.productId;
    const product = await Product.findById(prodId);
    const quantity = req.body.quantity

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          name: product.title,
          description: product.description,
          amount: product.price * 100,
          currency: 'usd',
          quantity: quantity,
        },
      ],
      success_url: `${process.env.SERVER_ADDRESS}/checkout/${req.userId}`, // => http://localhost:3500
      cancel_url: process.env.FRONTEND_ADDRESS + '/products/' + prodId,
    });

    // res.render('shop/product', {
    //   prod: product,
    //   pageTitle: 'Product',
    //   cartQuantity: totalQuantity,
    //   searchInfo: '',
    //   sessionId: session.id,
    // });
    res.status(200).json({ message: 'Feched successfully!', session });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getProducts = async (req, res, next) => {
  try {
    const products = await Product.find();

    // if (!preoducts) {}

    res.status(200).json({ message: 'Feched successfully!', products });
  } catch (err) {
    console.log(err);
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getNewProducts = async (req, res, next) => {
  try {
    const products = await Product.find().sort({ updatedAt: -1 });

    res.status(200).json({ message: 'Feched successfully!', products });
  } catch (err) {
    console.log(err);
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getBag = async (req, res, next) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    const prod = await user.populate('cart.items.productId');
    const products = prod.cart.items;
    let session;

    let totalPrice = products.reduce((prevVal, curVal) => {
      const currentVal = curVal.productId.price.toString().split('.')[0];
      return prevVal + +currentVal * curVal.quantity;
    }, 0);

    totalPrice += 0.99;

    const totalQuantity = products.reduce(
      (prevVal, curVal) => prevVal + curVal.quantity,
      0,
    );

    if (products.length > 0) {
      session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: products.map((p) => {
          return {
            name: p.productId.title,
            description: p.productId.description,
            images: [p.productId.imageUrl],
            amount: p.productId.price * 100,
            currency: 'usd',
            quantity: p.quantity,
          };
        }),
        success_url: `${process.env.SERVER_ADDRESS}/checkout/${userId}`, // => http://localhost:3500
        cancel_url: process.env.FRONTEND_ADDRESS + '/bag',
      });
    }

    res.status(200).json({
      message: 'Fetched bag sucessfully',
      publicKey: process.env.STRIPE_PUBLIC_KEY,
      products,
      totalPrice,
      totalQuantity,
      session: session || '',
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getOrders = async (req, res, next) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    const orders = user.order;
    res.status(200).json({
      message: 'Fetched orders sucessfully',
      orders,
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postBag = async (req, res, next) => {
  try {
    const userId = req.userId;
    const prodId = req.body.productId;
    const quantity = +req.body.quantity;

    const user = await User.findById(userId);
    user.addToCart(prodId, quantity);

    res.status(200).json({ message: 'Added to cart' });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.checkout = async (req, res, next) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId);
    user.addToOrder();

    res.redirect(process.env.FRONTEND_ADDRESS);
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.deleteBag = async (req, res, next) => {
  try {
    const userId = req.userId;
    const prodId = req.body.productId;

    const user = await User.findById(userId);
    user.deleteProduct(prodId);

    const prod = await user.populate('cart.items.productId');
    const products = prod.cart.items;
    const totalPrice = products.reduce(
      (prevVal, curVal) => prevVal + curVal.productId.price * curVal.quantity,
      0,
    );

    res.status(200).json({ message: 'Product deleted!', totalPrice });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getInvoice = async (req, res, next) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    const orderId = req.params.orderId;

    const order = user.order.find((el) => el._id == orderId);

    if (!order) {
      const error = new Error('No order found!');
      error.statusCode = 422;
      throw error;
    }

    const invoiceName = 'invoice-' + orderId + '.pdf';
    const invoicePath = path.join('data', 'invoices', invoiceName);

    const pdfDoc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      'inline; filename="' + invoiceName + '"',
    );
    // pdfDoc.pipe(fs.createWriteStream(invoicePath));
    pdfDoc.pipe(res);

    pdfDoc.rect(0, 0, 612, 20).fill('#ff00aa');
    pdfDoc.rect(0, 772, 612, 20).fill('#ff00aa');
    pdfDoc
      .font('font/static/Montserrat-Bold.ttf')
      .fontSize(18)
      .fillColor('#444')
      .text('INVOICE', {
        align: 'left',
      });

    pdfDoc
      .font('font/static/Montserrat-Regular.ttf')
      .fontSize(11)
      .text(`RoyaleBiba`, null, 140)
      .text(`18, Xyz street, abc.`, null, 155)
      .text(`Lagos State.`, null, 170)
      .text(`phone no: 113456789`, null, 185)
      .text(`Test@gmail.com`, null, 200)
      .text(
        `Date: 19-01-2021`,
        {
          align: 'right',
        },
        140,
      )
      .fill('#000')
      .text(
        `Invoice No: \n #${orderId}`,
        {
          align: 'right',
        },
        170,
      )
      .fill('#000')
      .text(
        user.name,
        {
          align: 'right',
        },
        250,
      )
      .text(`${user.email} \n 17, xyz street, Agege, \n Lagos State.`, {
        align: 'right',
      });

    // 		Table Header
    pdfDoc.rect(70, 345, 472, 20).fillAndStroke('#ff00aa');
    pdfDoc
      .font('font/static/Montserrat-Bold.ttf')
      .fillColor('#fff')
      .text('Title', 100, 350)
      .text('Quantity', 252, 350)
      .text('Unit Price', 325, 350)
      .text('Total', 455, 350);

    let positionY = 0;

    let totalPrice = 0;
    order.products.forEach((prod, idx) => {
      // 	Product
      totalPrice += prod.quantity * prod.product.price;
      pdfDoc
        .rect(70, 365 + idx * 20, 180, 20)
        .fillAndStroke(idx % 2 == 0 ? '#fff' : '#eee', '#aaaaaa');
      pdfDoc
        .rect(250, 365 + idx * 20, 50, 20)
        .fillAndStroke(idx % 2 == 0 ? '#fff' : '#eee', '#aaaaaa');
      pdfDoc
        .rect(300, 365 + idx * 20, 121, 20)
        .fillAndStroke(idx % 2 == 0 ? '#fff' : '#eee', '#aaaaaa');
      pdfDoc
        .rect(421, 365 + idx * 20, 121, 20)
        .fillAndStroke(idx % 2 == 0 ? '#fff' : '#eee', '#aaaaaa');
      pdfDoc
        .font('font/static/Montserrat-Regular.ttf')
        .fillColor('#000')
        .text(prod.product.title, 100, 370 + idx * 20)
        .text(prod.quantity, 255, 370 + idx * 20)
        .text(`$${prod.product.price}`, 310, 370 + idx * 20)
        .text(`$${prod.product.price * prod.quantity}`, 430, 370 + idx * 20);

      positionY++;
    });

    // 	Bottom
    pdfDoc
      .font('./font/static/Montserrat-Bold.ttf')
      .text('Sub-Total:', 355, 370 + positionY * 20);
    pdfDoc
      .rect(421, 365 + positionY * 20, 121, 20)
      .fillAndStroke(positionY % 2 == 0 ? '#fff' : '#eee', '#aaaaaa');
    pdfDoc
      .font('font/static/Montserrat-Regular.ttf')
      .fillColor('#000')
      .text(`$${totalPrice}`, 430, 370 + positionY * 20);

    pdfDoc.end();
    // fs.readFile(invoicePath, (err, data) => {
    //   if (err) {
    //     return next(err);
    //   }
    //   res.setHeader('Content-Type', 'application/pdf');
    //   res.setHeader(
    //     'Content-Disposition',
    //     'inline; filename="' + invoiceName + '"',
    //   );
    //   res.send(data);
    // });

    // const file = fs.createReadStream(invoicePath);
    // res.setHeader('Content-Type', 'application/pdf');
    // res.setHeader(
    //   'Content-Disposition',
    //   'inline; filename="' + invoiceName + '"',
    // );
    // file.pipe(res);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};