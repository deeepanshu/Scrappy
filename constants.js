const getOGTag = (metaDataProp) => `meta[property="${metaDataProp}"]`

const getMetaTag = (metaDataProp) => `meta[name="${metaDataProp}"]`

module.exports.getOGTag = getOGTag;
module.exports.getMetaTag = getMetaTag;

module.exports.configs = {
  PORT: 3000,
}