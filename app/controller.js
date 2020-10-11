const OGParser = require("./OGParser");

const controller = async (req, res, next) => {
  try {
    const { url } = req.body;
    const parser = new OGParser(url);
    await parser.getSiteInfo();
    parser.parseOGTags();
    parser.fallbacks();
    res.json({
      message: "Success",
      tags: parser.tags,
      triedToParse: [...parser.OG_TAGS, ...parser.TWITTER_TAGS],
    });
  } catch (error) {
    next(error);
  }
};

module.exports.controller = controller;
