const express = require("express");
const authorController = require("../controllers/authorController");

const authorRoutes = express.Router();

authorRoutes.get("/authors", authorController.getAllAuthors);
authorRoutes.get("/author/:id", authorController.getAuthorById);
authorRoutes.post("/author", authorController.createAuthor);
authorRoutes.post("/author/upload", authorController.uploadAuthorPhoto);
authorRoutes.put("/author/:id", authorController.updateAuthor);
authorRoutes.delete("/author/:id", authorController.deleteAuthor);

module.exports = authorRoutes;
