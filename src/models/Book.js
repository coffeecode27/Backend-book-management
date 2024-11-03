const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Author",
      required: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    stock: { type: Number, default: 0 }, // Stok buku tersedia
    borrowedCount: { type: Number, default: 0 }, // Jumlah peminjaman
    coverImageUrl: { type: String }, // URL sampul buku, opsional
  },
  { timestamps: true }
);

module.exports = mongoose.model("Book", bookSchema);
