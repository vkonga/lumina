const productModel = require('../models/productModel');

const getProducts = async (req, res, next) => {
  try {
    const { category } = req.query;
    const [products, siteContent] = await Promise.all([
      category ? productModel.getProductsByCategory(category) : productModel.getAllProducts(),
      productModel.getSiteContent(),
    ]);

    res.status(200).json({ products, siteContent });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
};
