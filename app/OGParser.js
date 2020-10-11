const cheerio = require('cheerio');
const axios = require('axios');
const {  getOGTag, getMetaTag } = require('../constants');
const { findImageTypeFromUrl, isImageTypeValid, isUrlValid } = require('./utils');

const isElementPresent = (selector, attribute, siteData) => (
  siteData(selector).attr(attribute) && siteData(selector).attr(attribute).length > 0
);

/**
 * Creates a new instance of OGParser
 * @param {string} url - The URL to be parsed
 * @author Deepanshu Jain <deepanshujain1234@live.com>
 */
const OGParser = function(url) {
  const MAIN_TAGS = ['og:title', 'og:url', 'og:type', 'og:image', 'og:description', 'og:locale'];
  const OPTIONAL_TAGS = ['og:site_name', 'og:image:secure_url']; 

  this.url = url;
  this.tags = {};
  
  this.OG_TAGS = [ ...MAIN_TAGS, ...OPTIONAL_TAGS ];
  this.TWITTER_TAGS = ['twitter:card', 'twitter:site', 'twitter:creator'];
  this.usingFallback = false;
};

/**
 * Gets the site information
 * @author Deepanshu Jain <deepanshujain1234@live.com>
 */
OGParser.prototype.getSiteInfo = async function() {
  const result = await axios.get(this.url);
  this.siteData =  cheerio.load(result.data);
}

/**
 * Parses the OG Tags
 */
OGParser.prototype.parseOGTags = async function() {
  this.OG_TAGS.forEach(tag => {
    if(tag === "og:image") 
      this.tags["og:image"] = [this.siteData(getOGTag(tag)).attr("content")].filter(ele => ele);
    else 
      this.tags = Object.assign(this.tags, {[tag]: this.siteData(getOGTag(tag)).attr("content")});
  })
  this.TWITTER_TAGS.forEach(tag => {
    this.tags = Object.assign(this.tags, {[tag]: this.siteData(getMetaTag(tag)).attr("content")});
  })
}

/**
 * Parses the other tags if og tags are not found
 */
OGParser.prototype.fallbacks = async function() {

  if(!this.tags['og:title']) {
    this.titleFallback();
  }
  if(!this.tags['og:description']) {
    this.descriptionFallback();
  }
  if(!this.tags['og:url']) {
    this.urlFallback();
  }
  if(this.tags['og:image'].length === 0) {
    this.imageFallback();
  }
  if(!this.tags['og:locale']) {
    this.localeFallback();
  }
  if(!this.tags['og:type']) {
    this.typeFallback();
  }

  // this.removeUndefineds()
}

/**
 * Parses head>title tag if og:title not found.
 */
OGParser.prototype.titleFallback = function() {
  if (!this.tags['og:title']) {
    if (this.siteData('title').text() && this.siteData('title').text().length > 0) {
      this.tags['og:title'] = this.siteData('title').text();
    } else if (this.siteData('head > meta[name="title"]').attr('content') && this.siteData('head > meta[name="title"]').attr('content').length > 0) {
      this.tags['og:title'] = this.siteData('head > meta[name="title"]').attr('content');
    }
  }
}

/**
 * Parses head>meta[description] tag if og:description not found.
 */
OGParser.prototype.descriptionFallback = function() {
  console.log("called")
  if (!this.tags['og:description']) {
    if (isElementPresent('head > meta[name="description"]', 'content', this.siteData)) {
      this.tags['og:description'] = this.siteData('head > meta[name="description"]').attr('content');
    } else if (isElementPresent('head > meta[name="Description"]', 'content', this.siteData)) {
      this.tags['og:description'] = this.siteData('head > meta[name="Description"]').attr('content');
    } else if (isElementPresent('head > meta[itemprop="description"]', 'content', this.siteData)) {
      this.tags['og:description'] = this.siteData('head > meta[itemprop="description"]').attr('content');
    } else if (this.siteData('#description').text() && this.siteData('#description').text().length > 0) {
      this.tags['og:description'] = this.siteData('#description').text();
    }
  }
}

/**
 * Parses Canonical link tag if og:url not found.
 */
OGParser.prototype.urlFallback = function() {
  if (!this.tags['og:url']) {
    if (isElementPresent('link[rel="canonical"]', 'href', this.siteData)) {
      this.tags['og:url'] = this.siteData('link[rel="canonical"]').attr('href');
    } else if (isElementPresent('link[rel="alternate"][hreflang="x-default"]', 'href', this.siteData)) {
      this.tags['og:url'] = this.siteData('link[rel="alternate"][hreflang="x-default"]').attr('href');
    }
  }
}

/**
 * Parses Images based on content, extension, and dimensions, if og:image not found.
 */
OGParser.prototype.imageFallback = function() {
  if ((Array.isArray(this.tags['og:image'])) || !this.tags['og:image']) {
    this.tags['og:image'] = [];
    this.siteData('img').map((index, imageElement) => {
      if (isElementPresent(imageElement, 'src', this.siteData)) {
        const source = this.siteData(imageElement).attr('src');
        const type = findImageTypeFromUrl(source);
        if (!isUrlValid(source) || !isImageTypeValid(type)) return false;
        this.tags['og:image'].push(source);
      }
      return false;
    });
  }
}

/**
 * Parses Locale, if og:locale not found.
 */
OGParser.prototype.localeFallback = function() {
  if (!this.tags['og:locale']) {
    if (isElementPresent('html', 'lang', this.siteData)) {
      this.tags['og:locale'] = this.siteData('html').attr('lang');
    } else if (isElementPresent('head > meta[itemprop="inLanguage"]', 'content', this.siteData)) {
      this.tags['og:locale'] = this.siteData('head > meta[itemprop="inLanguage"]').attr('content');
    }
  }
}

/**
 * Sets type to website, if no og:type found.
 */
OGParser.prototype.typeFallback = function() {
  if(!this.tags['og:type']) {
    this.tags['og:type'] = 'website';
  }
}

Object.prototype.removeUndefineds = function() {
  for (const tagName in this.tags) {
    if(!this.tags[tagName] || this.tags[tagName] === undefined ) {
      delete this.tags[tagName];
    }
  }
}

module.exports = OGParser;