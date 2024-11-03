const express = require("express");
const bookController = require("../controllers/bookController");

const bookRoutes = express.Router();

bookRoutes.get("/books", bookController.getAllBooks);
bookRoutes.get("/book/:id", bookController.getBookById);
bookRoutes.post("/book", bookController.createBook);
bookRoutes.post("/book/upload", bookController.uploadBookCover);
bookRoutes.put("/book/:id", bookController.updateBook);
bookRoutes.delete("/book/:id", bookController.deleteBook);

module.exports = bookRoutes;
