const fs = require("fs"); // Import fs untuk berinteraksi dengan sistem file
const Author = require("../models/Author");
const multer = require("multer");
const path = require("path");

// Konfigurasi multer untuk mengunggah foto author
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads/author")); // Simpan di folder uploads/author
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname); // Nama file unik
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(new Error("Unsupported file format"), false);
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

const authorController = {};

// Mendapatkan list author
authorController.getAllAuthors = async (req, res) => {
  try {
    const authors = await Author.find();
    res.status(200).json(authors);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving authors", error });
  }
};

// Mendapatkan detail author berdasarkan ID
authorController.getAuthorById = async (req, res) => {
  try {
    const author = await Author.findById(req.params.id);
    if (!author) return res.status(404).json({ message: "Author not found" });
    res.status(200).json(author);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving author", error });
  }
};

// Menambahkan data author baru
authorController.createAuthor = async (req, res) => {
  try {
    const author = new Author(req.body);
    await author.save();
    res.status(201).json(author);
  } catch (error) {
    res.status(500).json({ message: "Error creating author", error });
  }
};

// Mengupdate data author berdasarkan ID
authorController.updateAuthor = async (req, res) => {
  try {
    const updatedAuthor = await Author.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedAuthor)
      return res.status(404).json({ message: "Author not found" });
    res.status(200).json(updatedAuthor);
  } catch (error) {
    res.status(500).json({ message: "Error updating author", error });
  }
};

// Menghapus data author berdasarkan ID
authorController.deleteAuthor = async (req, res) => {
  try {
    const deletedAuthor = await Author.findByIdAndDelete(req.params.id);
    if (!deletedAuthor)
      return res.status(404).json({ message: "Author not found" });

    // Jika ada URL gambar, hapus file gambar
    if (deletedAuthor.profileImageUrl) {
      const filePath = path.join(
        __dirname, // backend/src/controllers
        "../uploads/author",
        deletedAuthor.profileImageUrl.split("/").pop()
      );
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error("Error deleting image:", err);
        }
      });
    }

    res.status(200).json({ message: "Author deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting author", error });
  }
};

// Mengunggah foto author
authorController.uploadAuthorPhoto = async (req, res) => {
  upload.single("photo")(req, res, async (err) => {
    if (err) {
      return res.status(500).json({ message: "Upload failed", error: err });
    }

    const authorId = req.body.authorId; // pastikan mengirimkan authorId bersamaan dengan upload
    if (!authorId) {
      return res.status(400).json({ message: "Author ID is required" });
    }

    try {
      const filePath = `/uploads/author/${req.file.filename}`;

      // Update author dengan image URL
      const updatedAuthor = await Author.findByIdAndUpdate(
        authorId,
        { profileImageUrl: filePath },
        { new: true }
      );

      if (!updatedAuthor) {
        return res.status(404).json({ message: "Author not found" });
      }

      res.status(200).json({
        message: "Photo uploaded successfully",
        filePath: filePath,
      });
    } catch (updateError) {
      res
        .status(500)
        .json({ message: "Error updating author image", error: updateError });
    }
  });
};

module.exports = authorController;
