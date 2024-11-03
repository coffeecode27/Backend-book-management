const mongoose = require("mongoose");

const stockLogSchema = new mongoose.Schema({
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
  borrowerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Borrower",
    required: true,
  },
  action: { type: String, required: true },
  quantity: { type: Number, required: true },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("StockLog", stockLogSchema);
