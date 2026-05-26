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

module.exports = {
  getHomeData,
};
