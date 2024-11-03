const mongoose = require("mongoose");

const authorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    bio: { type: String }, // Informasi tambahan tentang penulis
    profileImageUrl: { type: String }, // URL foto profil penulis, opsional
  },
  { timestamps: true }
);

module.exports = mongoose.model("Author", authorSchema);
