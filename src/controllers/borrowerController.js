const Borrower = require("../models/Borrower");

const borrowerController = {};

// Mendapatkan semua data peminjam
borrowerController.getAllBorrowers = async (req, res) => {
  try {
    const borrowers = await Borrower.find();
    res.status(200).json(borrowers);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving borrowers", error });
  }
};

// Mendapatkan data peminjam berdasarkan ID
borrowerController.getBorrowerById = async (req, res) => {
  try {
    const borrower = await Borrower.findById(req.params.id);
    if (!borrower) {
      return res.status(404).json({ message: "Borrower not found" });
    }
    res.status(200).json(borrower);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving borrower", error });
  }
};

// Menambahkan data peminjam baru
borrowerController.createBorrower = async (req, res) => {
  try {
    const { name, contact, address } = req.body;
    const newBorrower = new Borrower({ name, contact, address });
    await newBorrower.save();
    res.status(201).json({
      message: "Borrower created successfully",
      borrower: newBorrower,
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating borrower", error });
  }
};

// Memperbarui data peminjam
borrowerController.updateBorrower = async (req, res) => {
  try {
    const { name, contact, address } = req.body;
    const updatedBorrower = await Borrower.findByIdAndUpdate(
      req.params.id,
      { name, contact, address },
      { new: true }
    );
    if (!updatedBorrower) {
      return res.status(404).json({ message: "Borrower not found" });
    }
    res.status(200).json({
      message: "Borrower updated successfully",
      borrower: updatedBorrower,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating borrower", error });
  }
};

// Menghapus data peminjam
borrowerController.deleteBorrower = async (req, res) => {
  try {
    const deletedBorrower = await Borrower.findByIdAndDelete(req.params.id);
    if (!deletedBorrower) {
      return res.status(404).json({ message: "Borrower not found" });
    }
    res.status(200).json({ message: "Borrower deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting borrower", error });
  }
};

module.exports = borrowerController;
