const express = require("express");
const { configs } = require("./constants");
const expressApp = require('./app/express');
const app = express();

expressApp(app);

app.listen(configs.PORT, () => {
  console.log("Server up and running");
});
