const mongoose = require("mongoose");

const borrowerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    contact: { type: String, required: true }, // Kontak peminjam
    address: { type: String }, // Alamat peminjam, opsional
  },
  { timestamps: true }
);

module.exports = mongoose.model("Borrower", borrowerSchema);
