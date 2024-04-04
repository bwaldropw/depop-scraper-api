import { loadPageContent } from '../utils/scraper.utils.mjs';

const scrapeSellerInfo = async (sellerId) => {
  try {
    const $ = await loadPageContent(`https://www.depop.com/${sellerId}`);

    const iconElement = $('img.sc-jGFluD');
    const iconLink = $(iconElement).attr('src');

    const verifiedIcon = $('svg.sc-fWYGza');
    let isVerified = false;
    if (verifiedIcon.length > 0) {
      isVerified = true;
    }

    const feedbackButton = $('button[data-testid="feedback-btn"]');
    const feedbackText = $(feedbackButton).attr('aria-label');
    const numPattern = /\d+(\.\d+)?/g;
    const numMatches = feedbackText.match(numPattern);

    const rating = parseFloat(numMatches[1]);
    const numReviews = parseInt(numMatches[0]);

    const soldText = $('div[data-testid="signals__sold"]').find('p').text();
    let numSold = 0;
    if (soldText.length > 0) {
      const numMatch = soldText.match(numPattern);
      numSold = parseInt(numMatch);
    }

    const status = $('div[data-testid="signals__active"]').find('p').text();
    // TODO Parse to integer
    const followersText = $('p[data-testid="followers__count"]').text();
    const followingText = $('p[data-testid="following__count"]').text();
    const shopName = $('p.styles__ShopNameText-sc-30d6819b-13').text();

    const data = {
      sellerId: sellerId,
      iconLink: iconLink,
      isVerified: isVerified,
      pageLink: `https://www.depop.com/${sellerId}/`,
      rating: rating,
      numReviews: numReviews,
      numSold: numSold,
      status: status,
      numFollowers: followersText,
      numFollowing: followingText,
      shopName: shopName,
    };

    return data;
  } catch (error) {
    throw error;
  }
};

const scrapeSellerProducts = async (sellerId) => {
  try {
    const $ = await loadPageContent(`https://www.depop.com/${sellerId}`);
    
    const productList = [];
    $('ul[data-testid="product__items"] li').each((index, element) => {
      const productLink = $(element).find('a[data-testid="product__item"]').attr('href');

      const productIdMatches = productLink.match(/\/products\/(.*)/);
      const productId = productIdMatches ? productIdMatches[1].replace(/\/$/, '') : null;

      const thumbnailLink = $(element).find('img.sc-htehQK.fmdgqI').attr('src');

      let fullPrice = null;
      let discountedPrice = null;

      const priceElement = $(element).find('p[aria-label="Price"]');
      if (priceElement.length) {
        fullPrice = priceElement.text();
      }
      
      const fullPriceElement = $(element).find('p[aria-label="Full price"]');
      if (fullPriceElement.length) {
        fullPrice = fullPriceElement.text();
      }
      
      const discountedPriceElement = $(element).find('p[aria-label="Discounted price"]');
      if (discountedPriceElement.length) {
        discountedPrice = discountedPriceElement.text();
      }

      const product = {
        productId: productId,
        productLink: `https://www.depop.com${productLink}`,
        thumbnailLink: thumbnailLink,
        fullPrice: fullPrice,
        discountedPrice: discountedPrice,
      }

      productList.push(product);
    })

    return productList;
  } catch (error) {
    throw error;
  }
};

export { scrapeSellerInfo, scrapeSellerProducts };
