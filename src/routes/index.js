const express = require("express");
const authorRoutes = require("./authorRoutes");
const categoryRoutes = require("./categoryRoutes");
const bookRoutes = require("./bookRoutes");
const borrowerRoutes = require("./borrowerRoutes");
const loanRoutes = require("./loanRoutes");

const routes = express.Router();

// kumpulkan semua routes disini per bagian ex : /author,/books dll
routes.use(authorRoutes);
routes.use(categoryRoutes);
routes.use(bookRoutes);
routes.use(borrowerRoutes);
routes.use(loanRoutes);

module.exports = routes;
