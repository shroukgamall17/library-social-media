const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const {
  getAllBook,
  addBook,
  searchByCategory,
  updateBook,
  deleteBook,
  getSingleBook,
  searchByTitle,
  addFavoriteBook,
  removeFavoriteBook,
  getAllCategory,
} = require("../controllers/bookController");
const { auth } = require("../controllers/authController");
// Define multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../bookImage/");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString().replace(/:/g, "-") + file.originalname);
  },
});

const upload = multer({ storage: storage });
const router = express.Router();
// Get All Book
router.get("/", getAllBook);
// Get All Category
router.get("/categories", getAllCategory);
//search by category
router.get("/searchCategory", searchByCategory);
//search by title
router.get("/searchTitle", searchByTitle);

//Add book
// router.post('/',upload.single('pdf'),addBook);
// router.post(
//   "/:authorId",
//   upload.fields([
//     { name: "Pdf", maxCount: 1 },
//     { name: "cover", maxCount: 1 },
//   ]),
//   addBook
// );
router.post(
  "/",
  upload.fields([
    { name: "Pdf", maxCount: 1 },
    { name: "cover", maxCount: 1 },
  ]),
  addBook
);
//Update book

//getSingle Book
router.get("/single/:id", getSingleBook);
//addFavoriteBook
router.post("/addFavoriteBook/:userId/:bookId", auth, addFavoriteBook);
//removeFavoriteBook
router.post("/removeFavoriteBook/:userId/:bookId", removeFavoriteBook);
router.put(
  "/:id",
  upload.fields([
    { name: "Pdf", maxCount: 1 },
    { name: "cover", maxCount: 1 },
  ]),
  updateBook
);
//delete book
router.delete("/:id", deleteBook);
module.exports = router;
