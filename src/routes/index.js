const express = require("express");
const router = express.Router();
const filecontroller = require("../controller/file.controller");
const tokencontroller = require("../controller/tokens.controller");

let routes = (app) => {
  router.post("/upload", filecontroller.upload);
  router.get("/files", filecontroller.getListFiles);
  router.get("/files/:name", filecontroller.download);
  router.get("/avgPrice", tokencontroller.getTokenAvgPrice);

  app.use(router);
};

module.exports = routes;
