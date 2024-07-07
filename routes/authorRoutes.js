const express = require("express");
const {
  createAuthor,
  getAuthor,
  deleteAuthor,
  getSingleAuthor,
  searchByName,
  updateAuthor,
} = require("../controllers/authorController");
const router = express.Router();

//get authors
router.get("/", getAuthor);
//get single author
router.get("/:authorId", getSingleAuthor);
//delete author
router.delete("/:authorId", deleteAuthor);
//create author
router.post("/", createAuthor);
//search by name
router.get("/", searchByName);
//update Author
router.patch("/:authorId", updateAuthor);

module.exports = router;
