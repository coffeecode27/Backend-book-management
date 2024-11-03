const Loan = require("../models/Loan");
const Book = require("../models/Book");
const StockLog = require("../models/StockLog");

const loanController = {};

// Fungsi untuk membuat peminjaman baru
loanController.createLoan = async (req, res) => {
  try {
    const { borrowerId, bookId } = req.body;

    // Pastikan borrowerId dan bookId disediakan
    if (!borrowerId || !bookId) {
      return res
        .status(400)
        .json({ message: "Borrower ID and Book ID are required" });
    }

    // Buat peminjaman baru
    const newLoan = new Loan({
      borrowerId,
      bookId,
      loanDate: new Date(),
    });

    // Simpan peminjaman ke database
    await newLoan.save();

    // Perbarui borrowedCount dan kurangi stok di Book
    const book = await Book.findById(bookId);
    if (book) {
      book.borrowedCount += 1;
      if (book.stock > 0) {
        book.stock -= 1; // Kurangi stok
      } else {
        return res
          .status(400)
          .json({ message: "Stock unavailable for this book" });
      }
      await book.save();
    }

    // Buat log di StockLog dengan borrowerId
    const stockLog = new StockLog({
      borrowerId, // Tambahkan borrowerId di sini
      bookId,
      action: "borrow",
      quantity: 1,
      date: new Date(),
    });
    await stockLog.save();

    res
      .status(201)
      .json({ message: "Loan created successfully", loan: newLoan });
  } catch (error) {
    res.status(500).json({ message: "Error creating loan", error });
  }
};

// Definisikan metode perhitungan denda (bisa diubah ke 'days' untuk menghitung berdasarkan hari)
const FEE_CALCULATION_METHOD = "minutes"; // 'minutes' atau 'days'

// Fungsi untuk menghitung keterlambatan dalam menit
const calculateLateFeeInMinutes = (loanDate, returnDate) => {
  const loanDurationInMinutes = 1; // Misalnya, satu menit
  const dueDate = new Date(
    loanDate.getTime() + loanDurationInMinutes * 60 * 1000
  );
  const isLate = returnDate > dueDate;
  return isLate ? Math.ceil((returnDate - dueDate) / (1000 * 60)) : 0; // Mengembalikan menit terlambat
};

// Fungsi untuk menghitung keterlambatan dalam hari
const calculateLateFeeInDays = (loanDate, returnDate) => {
  const loanDurationInDays = 1; // Misalnya, satu hari
  const dueDate = new Date(
    loanDate.getTime() + loanDurationInDays * 24 * 60 * 60 * 1000
  );
  const isLate = returnDate > dueDate;
  return isLate ? Math.ceil((returnDate - dueDate) / (1000 * 60 * 60 * 24)) : 0; // Mengembalikan hari terlambat
};

// Fungsi untuk mengembalikan buku
loanController.returnBook = async (req, res) => {
  try {
    const { loanId } = req.params;

    const loan = await Loan.findById(loanId);
    if (!loan || loan.isReturned) {
      return res
        .status(404)
        .json({ message: "Loan not found or already returned" });
    }

    loan.isReturned = true;
    loan.returnDate = new Date();

    const loanDate = loan.loanDate;
    const returnDate = new Date();

    // Hitung keterlambatan dan denda berdasarkan metode yang ditentukan
    let lateFees = 0;
    if (FEE_CALCULATION_METHOD === "minutes") {
      const lateMinutes = calculateLateFeeInMinutes(loanDate, returnDate);
      lateFees = lateMinutes * 5000; // Denda berdasarkan menit
    } else if (FEE_CALCULATION_METHOD === "days") {
      const lateDays = calculateLateFeeInDays(loanDate, returnDate);
      lateFees = lateDays * 10000; // Denda berdasarkan hari
    }

    loan.lateFees = lateFees;

    await loan.save();

    const book = await Book.findById(loan.bookId);
    if (book) {
      book.borrowedCount = Math.max(book.borrowedCount - 1, 0);
      book.stock += 1;
      await book.save();
    }

    const stockLog = new StockLog({
      borrowerId: loan.borrowerId,
      bookId: loan.bookId,
      action: "return",
      quantity: 1,
      date: new Date(),
    });
    await stockLog.save();

    const populatedLoan = await Loan.findById(loan._id)
      .populate("borrowerId", "name address contact") // Tambahkan 'address' jika Anda ingin menampilkannya
      .populate("bookId", "title");

    res.status(200).json({
      message: "Book returned successfully",
      loanDetails: {
        loanId: populatedLoan._id,
        borrowerName: populatedLoan.borrowerId.name,
        borrowerAddress: populatedLoan.borrowerId.address, // Jika ada field address
        borrowerContact: populatedLoan.borrowerId.contact,
        bookTitle: populatedLoan.bookId.title,
        loanDate: populatedLoan.loanDate,
        returnDate: populatedLoan.returnDate,
        lateFees: populatedLoan.lateFees,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error returning book", error });
  }
};

// Fungsi untuk mendapatkan daftar peminjaman aktif
loanController.getActiveLoans = async (req, res) => {
  try {
    const activeLoans = await Loan.find({ isReturned: false })
      .populate("borrowerId", "name contact") // Mengambil data peminjam
      .populate("bookId", "title"); // Mengambil data buku

    res.status(200).json(activeLoans);
  } catch (error) {
    res.status(500).json({ message: "Error fetching active loans", error });
  }
};

// Fungsi untuk mendapatkan log peminjaman berdasarkan ID peminjam
loanController.getStockLogsByBorrowerId = async (req, res) => {
  try {
    const { borrowerId } = req.params;

    // Cari semua log di StockLog berdasarkan borrowerId
    const stockLogs = await StockLog.find({ borrowerId })
      .populate("bookId", "title") // Mengambil informasi judul buku
      .populate("borrowerId", "name contact address") // Mengambil informasi peminjam
      .exec();

    if (!stockLogs || stockLogs.length === 0) {
      return res
        .status(404)
        .json({ message: "No stock logs found for this borrower" });
    }

    // Menambahkan detail peminjam ke dalam log
    const responseLogs = stockLogs.map((log) => ({
      bookTitle: log.bookId.title,
      action: log.action,
      quantity: log.quantity,
      date: log.date,
      borrowerName: log.borrowerId.name,
      borrowerContact: log.borrowerId.contact,
      borrowerAddress: log.borrowerId.address,
    }));

    res.status(200).json(responseLogs);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching stock logs for borrower", error });
  }
};

module.exports = loanController;
