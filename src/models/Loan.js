const mongoose = require("mongoose");

const loanSchema = new mongoose.Schema(
  {
    borrowerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Borrower",
      required: true,
    },
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },
    loanDate: { type: Date, default: Date.now }, // Tanggal peminjaman
    returnDate: { type: Date }, // Tanggal pengembalian, opsional
    isReturned: { type: Boolean, default: false }, // Status apakah sudah dikembalikan
    lateFees: { type: Number, default: 0 }, // Denda keterlambatan
  },
  { timestamps: true }
);

module.exports = mongoose.model("Loan", loanSchema);
