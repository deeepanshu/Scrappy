const validator = require('validator');

/**
 * Returns the extension of the file.
 * @param {string} url - URL from which extension to be parsed
 * @author Deepanshu Jain <deepanshujain1234@live.com>
 * @returns {string} type of file
 */
const findImageTypeFromUrl = (url) => {
  let type = url.split('.').pop();
  [type] = type.split('?');
  return type;
};

/**
 * Returns if provided file extension is an image
 * @param {string} extension - extension to be checked
 * @author Deepanshu Jain <deepanshujain1234@live.com>
 * @returns {boolean} true/false, if file is an image
 */
const isImageTypeValid = (type) => {
  const validImageTypes = ['apng', 'bmp', 'gif', 'ico', 'cur', 'jpg', 'jpeg', 'jfif', 'pjpeg', 'pjp', 'png', 'svg', 'tif', 'tiff', 'webp'];
  return validImageTypes.includes(type);
};

/**
 * Returns if provided url is valid
 * @param {string} url - url to be checked
 * @author Deepanshu Jain <deepanshujain1234@live.com>
 * @returns {boolean} true/false, if url is valid
 */
const isUrlValid = (url) => typeof url === 'string' && url.length > 0 && validator.isURL(url, {
  protocols: ['http', 'https'],
  require_tld: true,
  require_protocol: false,
  require_host: true,
  require_valid_protocol: true,
  allow_underscores: false,
  host_whitelist: false,
  host_blacklist: false,
  allow_trailing_dot: false,
  allow_protocol_relative_urls: false,
  disallow_auth: false,
});

/**
 * Middleware to validate req.body
 * @author Deepanshu Jain <deepanshujain1234@live.com>
 */
const requestValidator = (req, res, next) => {
    let { body } = req;
    let { url } = body;
    if (!url || !isUrlValid(url)) {
      throw new Error("Invalid URL Provided");
    }
    next();
}

/**
 * Error handler
 * @author Deepanshu Jain <deepanshujain1234@live.com>
 */
const errorHandler = (err, req, res, next) => {
  res.status(err.status || 500);
  res.json({ status: err.status || 500, message: err.message || "Something went wrong", error: true });
}

/**
 * Wrong API Call 404
 * @author Deepanshu Jain <deepanshujain1234@live.com>
 */
const notFoundHandler = (req, res, next) => {
  const err = new Error('Not Found');
  err['status'] = 404;
  next(err);
}

module.exports.findImageTypeFromUrl = findImageTypeFromUrl;
module.exports.isImageTypeValid = isImageTypeValid; 
module.exports.isUrlValid = isUrlValid;
module.exports.requestValidator = requestValidator;
module.exports.errorHandler = errorHandler;
module.exports.notFoundHandler = notFoundHandler;