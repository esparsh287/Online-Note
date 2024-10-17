const express = require('express');
const router = express.Router();
const fetchUser = require('../middleware/fetchUser');
const Note = require('../models/Note'); // Use singular 'Note'
const { body, validationResult } = require('express-validator');

// Get all Notes
router.get('/fetchallnotes', fetchUser, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id }); 
    res.json(notes);
  } catch (error) {
    console.log(error.message);
    res.status(500).send('Some error occurred');
  }
});

// Add a new note
router.post(
  '/addnote',
  fetchUser,
  [
    body('title', 'Enter a valid title:').isLength({ min: 3 }),
    body('description', 'Must be 5 characters:').isLength({ min: 5 }),
  ],
  async (req, res) => {
    try {
      const { title, description, tag } = req.body;
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const note = new Note({
        title,
        description,
        tag,
        user: req.user.id,
      });
      const savedNote = await note.save();
      res.json(savedNote);
    } catch (error) {
      console.log(error.message);
      res.status(500).send('Some error occurred');
    }
  }
);

//Update Note
router.put(
  '/updatenote/:id',
  fetchUser, async (req, res) => {
    const {title, description, tag}= req.body;
    try {
      const newNote={};
    if(title){newNote.title= title};
    if(description){newNote.description= description};
    if(tag){newNote.tag= tag};

    let note= await Note.findById(req.params.id);
    if(!note){res.status(404).send('Not Found')}
    if(note.user.toString()!== req.user.id){
      return res.status(401).send('Not allowed');
    }
    note= await Note.findByIdAndUpdate(req.params.id, {$set: newNote}, {new: true})
    res.json({note});
    } catch (error) {
      console.log(error.message);
    res.status(500).send('Some error occurred');
    }
    

  });

  //Delete Note
router.delete(
  '/deletenote/:id',
  fetchUser, async (req, res) => {
    try {
      let note= await Note.findById(req.params.id);
      if(!note){res.status(404).send('Not Found')}
  
  
      if(note.user.toString()!== req.user.id){
        return res.status(401).send('Not allowed');
      }
      note= await Note.findByIdAndDelete(req.params.id)
      res.json("Note has been deleted");
  
    } catch (error) {
      console.log(error.message);
      res.status(500).send('Some error occurred');
    }
    

   
  });


module.exports = router;
