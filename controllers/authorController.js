const Author = require('../models/authorModel');

createAuthor = async (req, res) => {
  const { name, description, dateOfBirth, country } = req.body;

  try {
    const author = new Author({ name, description, dateOfBirth, country });
    await author.save();
    res.status(201).json({message: "Added Successfully",Data:author});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAuthor = async (req, res) => {
    try {
      const authors = await Author.find({}).sort({ createdAt: -1 }).populate('books');
      res.status(200).json({ message: "success", Data: authors });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };

  const deleteAuthor=async (req,res)=>{
    try {
      const {authorId}=req.params;
      const deletedAuthor = await Author.findByIdAndDelete(authorId);
      if (!deletedAuthor) {
        return res.status(404).json({ message: "Author not found" });
      }
      res.status(200).json({ message: "Author deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: err.message });
    }
  }

    const getSingleAuthor = async (req, res) => {
    try {
      const {authorId}=req.params;
      const author = await Author.findById(authorId).populate('books')
      if (!author) {
        return res.status(404).json({ message: "Author not found" });
      }
      res.status(200).json(author);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  const searchByName = async (req, res) => {
    try {
      const { name } = req.query;
      const author = await Author.find({ name: name })
  
      res.status(200).json(author);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  const updateAuthor = async (req, res) => {
    try {
      const { authorId } = req.params;
      
      const { name,country,dateOfBirth,description } = req.body;
      console.log(dateOfBirth)
     
      const updateAuthor = await Author.findByIdAndUpdate(
        authorId,
        { name,country ,dateOfBirth,description},
        { new: true }
      );
      if (!updateAuthor) {
        res.status(404).json("No author with this Id found.");
      }
      res.status(200).json({ Data: updateAuthor });
    } catch (err) {
      res.status(500).json("Error updating the Author");
    }
  };
  

module.exports = {
    getAuthor,
    createAuthor,
    deleteAuthor,
    getSingleAuthor,
    searchByName,
    updateAuthor
  };
  