const bookModel = require("../models/bookModel");
const User = require("../models/userModel");
const authorModel = require("../models/authorModel");
// func GetAllBook
const getAllBook = async (req, res) => {
  try {
    const books = await bookModel.find({}).populate(['authorId','ratings'])
    res.status(200).json({ message: "success", Data: books });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET all category
const getAllCategory = async (req, res) => {
  try {
    const categories = await bookModel.distinct('category');
    res.status(200).json({ message: "success", data: categories });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//add book

// const addBook = async (req, res) => {
//   try {
//     const files = req.files;
//     let Pdf = "";
//     let cover = "";

//     if (files && files.Pdf) {
//       Pdf = files.Pdf[0].filename;
//     }

//     if (files && files.cover) {
//       cover = files.cover[0].filename;
//     }
//     const { title, description, category } = req.body;
//     const { authorId } = req.params;

//     // Check if required fields are missing
//     if (!title || !description || !category) {
//       return res
//         .status(400)
//         .json({
//           message: "Title, description, and category are required fields.",
//         });
//     }

//     // Create the new book
//     const newBook = await bookModel.create({
//       authorId,
//       title,
//       description,
//       category,
//       Pdf,
//       cover,
//     });

//     // Update the author with the new book's ID
//     await authorModel.findByIdAndUpdate(
//       authorId,
//       { $push: { books: newBook._id } }, 
//       { new: true, useFindAndModify: false }
//     );

//     res.status(200).json({ message: "Added successfully", data: newBook });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };




const addBook = async (req, res) => {
  try {
    const files = req.files;
    let Pdf = "";
    let cover = "";

    if (files && files.Pdf) {
      Pdf = files.Pdf[0].filename;
    }

    if (files && files.cover) {
      cover = files.cover[0].filename;
    }
    const { title, description, category,authorId } = req.body;
    // const { authorId } = req.params;

    // Check if required fields are missing
    if (!title || !description || !category || !authorId) {
      return res
        .status(400)
        .json({
          message: "Title, description, category, and authorId are required fields.",
        });
    }

       // Check if author exists
       const existingAuthor = await authorModel.findById(authorId);
       if (!existingAuthor) {
         return res.status(404).json({ message: "Author not found." });
       }

    // Create the new book
    const newBook = await bookModel.create({
      authorId,
      title,
      description,
      category,
      Pdf,
      cover,
    });

    // Update the author with the new book's ID
    await authorModel.findByIdAndUpdate(
      authorId,
      { $push: { books: newBook._id } }, 
      { new: true, useFindAndModify: false }
    );

    //  // Send notification to the user
    //  await createNotification(
    //   null, 
    //   authorId,
    //   "new-book",
    //   `Book "${book.title}" has been added.`
    // );
    res.status(200).json({ message: "Added successfully", data: newBook });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


//func update
// const updateBook = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const files = req.files;
//     if (files && files.Pdf) {
//       Pdf = files.Pdf[0].filename;
//     }

//     if (files && files.cover) {
//       cover = files.cover[0].filename;
//     }
//     const { title, description, category } = req.body;
//     const newBook = await bookModel.findByIdAndUpdate(
//       id,
//       { title, description, category, cover, Pdf },
//       { new: true }
//     );
//     if (!newBook)
//       return res.status(404).json({ message: "not find book with id" });
//     else {
//       res.status(200).json({ message: "updata sucess", data: newBook });
//     }
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };


const updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const files = req.files;
    let updateFields = {};

    if (files && files.Pdf) {
      updateFields.Pdf = files.Pdf[0].filename;
    }

    if (files && files.cover) {
      updateFields.cover = files.cover[0].filename;
    }

    const { title, description, category } = req.body;

    // Only include cover in updateFields if files.cover exists
    if (files && files.cover) {
      updateFields.cover = files.cover[0].filename;
    }

    const newBook = await bookModel.findByIdAndUpdate(
      id,
      { title, description, category, ...updateFields },
      { new: true }
    );

    if (!newBook) {
      return res.status(404).json({ message: "Book not found with id" });
    } else {
      res.status(200).json({ message: "Update successful", data: newBook });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//func dele
const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;
    const delBook = await bookModel.findByIdAndDelete(id);
    if (!delBook) {
      return res.status(404).json({ message: "Book not found with id" });
    }

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//func getsingle book
const getSingleBook = async (req, res) => {
  try {
    const { id } = req.params;
    const singleBook = await bookModel.findById(id).populate(['authorId','ratings']);
    res.status(200).json({ message: "get success", data: singleBook });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
const searchByCategory = async (req, res) => {
  try {
    const { category } = req.query;
    const findBook = await bookModel.find({ category });
    res.status(200).json(findBook);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
// const searchByTitle = async (req, res) => {
//   try {
//     const { title } = req.query;
//     const findBook = await bookModel.find({ title });
//     res.status(200).json(findBook);
//   } catch (error) {
//     return res.status(500).json({ message: error.message });
//   }
// };
const searchByTitle = async (req, res) => {
  try {
    const { title } = req.query;
    
    if (!title) {
      return res.status(400).json({ message: 'Title parameter is required' });
    }
    
    const findBook = await bookModel.find({ title: { $regex: new RegExp(title, 'i') } });
    
    res.status(200).json(findBook);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


const addFavoriteBook = async (req, res) => {
  try {
    const { userId, bookId } = req.params;

    if (!userId || !bookId) {
      return res
        .status(400)
        .json({ message: "User ID and Book ID are required." });
    }

    const book = await bookModel.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: "Book not found." });
    }

    // Add the book to the user's favorite books array if it's not already there
    const user = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { favouriteBooks: bookId } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({ message: "Book added to favorites.", data: user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


const removeFavoriteBook = async (req, res) => {
  try {
    const { userId, bookId } = req.params;

    if (!userId || !bookId) {
      return res.status(400).json({ message: "User ID and Book ID are required." });
    }

    // Remove the book from the user's favorite books array
    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { favouriteBooks: bookId } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({ message: "Book removed from favorites.", data: user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



module.exports = {
  getAllBook,
  searchByCategory,
  addBook,
  updateBook,
  deleteBook,
  getSingleBook,
  searchByTitle,
  addFavoriteBook,
  removeFavoriteBook,
  getAllCategory
};
