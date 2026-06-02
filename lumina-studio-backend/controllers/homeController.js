const homeModel = require('../models/homeModel');

const getHomeData = async (req, res, next) => {
  try {
    const [hero, services, gallery, testimonial, siteContent, youtubeSlides, portfolioVideos] = await Promise.all([
      homeModel.getHeroData(),
      homeModel.getServicesData(),
      homeModel.getGalleryData(),
      homeModel.getTestimonialData(),
      homeModel.getSiteContent(),
      homeModel.getYoutubeSlides(),
      homeModel.getPortfolioVideos(),
    ]);

    res.status(200).json({
      hero,
      services,
      gallery,
      testimonial,
      siteContent,
      youtubeSlides,
      portfolioVideos,
    });
  } catch (error) {
    next(error);
  }
};

const addReview = async (req, res, next) => {
  try {
    const { quote, location } = req.body;
    const author = req.user.username;

    if (!quote || !quote.trim()) {
      return res.status(400).json({ error: 'Review text (quote) is required.' });
    }

    const newReview = await homeModel.createTestimonial({
      quote: quote.trim(),
      author,
      location: location ? location.trim() : 'TUNI, ANDHRA PRADESH'
    });

    res.status(201).json({
      success: true,
      message: 'Review added successfully.',
      review: newReview
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getHomeData,
  addReview,
};
