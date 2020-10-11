const bodyParser = require("body-parser");
const { requestValidator, errorHandler, notFoundHandler } = require("./utils");
const { controller } = require("./controller");

module.exports = (app) => {
  app.use(bodyParser.json());
  app.post("/api/parse", requestValidator, controller);
  app.use(notFoundHandler);
  app.use(errorHandler);
};
