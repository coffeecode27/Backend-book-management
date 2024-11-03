const fs = require("fs"); // Import fs untuk berinteraksi dengan sistem file
const Book = require("../models/Book");
const multer = require("multer");
const path = require("path");

const bookController = {};

// Setup multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads/book")); // Simpan di folder uploads/books
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

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

// Get all books
bookController.getAllBooks = async (req, res) => {
  try {
    const books = await Book.find().populate("authorId").populate("categoryId");
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving books", error });
  }
};

// Get book by ID
bookController.getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
      .populate("authorId")
      .populate("categoryId");
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
    res.status(200).json(book);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving book", error });
  }
};

// Create a new book with cover upload (if provided)
bookController.createBook = (req, res) => {
  upload.single("cover")(req, res, async (err) => {
    if (err) {
      return res.status(500).json({ message: "Upload failed", error: err });
    }

    try {
      const { title, authorId, categoryId, stock, borrowedCount } = req.body;
      const coverImageUrl = req.file
        ? `/uploads/books/${req.file.filename}`
        : undefined;

      const newBook = new Book({
        title,
        authorId,
        categoryId,
        stock,
        borrowedCount,
        coverImageUrl,
      });

      await newBook.save();
      res
        .status(201)
        .json({ message: "Book created successfully", book: newBook });
    } catch (error) {
      res.status(500).json({ message: "Error creating book", error });
    }
  });
};

// Update a book
bookController.updateBook = async (req, res) => {
  try {
    const updatedBook = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    })
      .populate("authorId")
      .populate("categoryId");

    if (!updatedBook) {
      return res.status(404).json({ message: "Book not found" });
    }
    res
      .status(200)
      .json({ message: "Book updated successfully", book: updatedBook });
  } catch (error) {
    res.status(500).json({ message: "Error updating book", error });
  }
};

// Delete a book and its cover image
bookController.deleteBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Jika buku memiliki URL cover image, hapus file gambar tersebut
    if (book.coverImageUrl) {
      const filePath = path.join(
        __dirname,
        "../uploads/books",
        book.coverImageUrl.split("/").pop()
      );
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error("Error deleting cover image:", err);
        }
      });
    }

    res.status(200).json({ message: "Book deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting book", error });
  }
};

// Upload book cover
bookController.uploadBookCover = (req, res) => {
  upload.single("cover")(req, res, async (err) => {
    if (err) {
      return res.status(500).json({ message: "Upload failed", error: err });
    }

    const bookId = req.body.bookId;
    if (!bookId) {
      return res.status(400).json({ message: "Book ID is required" });
    }

    try {
      const filePath = `/uploads/book/${req.file.filename}`;

      // Update book dengan cover image URL
      const updatedBook = await Book.findByIdAndUpdate(
        bookId,
        { coverImageUrl: filePath },
        { new: true }
      );

      if (!updatedBook) {
        return res.status(404).json({ message: "Book not found" });
      }

      res.status(200).json({
        message: "Cover uploaded successfully",
        filePath: filePath,
      });
    } catch (updateError) {
      res
        .status(500)
        .json({ message: "Error updating book cover", error: updateError });
    }
  });
};

module.exports = bookController;
