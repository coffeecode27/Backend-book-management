const express = require("express");
const loanController = require("../controllers/loanController");

const loanRoutes = express.Router();

loanRoutes.post("/borrow/book", loanController.createLoan);
loanRoutes.get("/borrow/book/list", loanController.getActiveLoans);
loanRoutes.post("/borrow/book/return/:loanId", loanController.returnBook);
loanRoutes.get(
  "/stocklog/borrower/:borrowerId",
  loanController.getStockLogsByBorrowerId
);

module.exports = loanRoutes;
