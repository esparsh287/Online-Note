const express = require('express');
const User = require('../models/User');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const JWT_SECRET='Tamrakardon';
const jwt = require('jsonwebtoken');
var fetchUser= require ('../middleware/fetchUser');

// CREATE a user using POST "/api/auth"
router.post('/createuser', [
  body('name', 'Enter your name:').isLength({ min: 4 }),
  body('email', 'Enter a valid Email:').isEmail(),
  body('password', 'Password must be at least 5 characters long:').isLength({ min: 5 })
], async (req, res) => {
    let success= false;
  // Validate the request body
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({success, errors: errors.array() });
  }
  try {
    // Create a new user in the database
    let user= await User.findOne({email: req.body.email});
    if(user){
      return res.status(400).json({success, error: "email already exists"})
    }
    const salt= await bcrypt.genSalt(10);
    const secPass= await  bcrypt.hash(req.body.password, salt)
     user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: secPass,
    });
    const data= {
      user:{
        id:user.id
      }
    }
    const authToken=jwt.sign(data, JWT_SECRET);
    // Send the created user as a response
    success=true;
    res.json({success, authToken});
  }catch (error) {
      console.log(error.message);
      res.status(500).send("Some error occurred")
    }
});

//authenticate a user; login
router.post('/login', [
  body('email', 'Enter a valid Email:').isEmail(),
  body('password', 'Enter your password:').exists(),

], async (req, res) => {
  let success=false;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    success=false
    return res.status(400).json({ errors: errors.array() });
  }
  const {email,password}=req.body;
  try {
    let user= await User.findOne({email});
    if(!user){
      success=false
      return res.status(400).json({error:"Sorry User does not exist"});
    }
    const passwordCompare= await bcrypt.compare(password, user.password);
    if(!passwordCompare){
      success=false
      return res.status(400).json({success, error:"Sorry User does not exist"});
    }
    const data={
      user:{
        id: user.id
      }
    }
    const authtoken= jwt.sign(data, JWT_SECRET);
    success=true;
    res.json({success, authtoken});
  } catch (error) {
    console.log(error.message);
      res.status(500).send("Some error occurred");
  }
}
)

//Get logged in user details

router.post('/getuser', fetchUser, async (req, res) => {
try {
  userId=req.user.id;
  const user= await User.findById(userId).select("-password");
  res.send(user);
  
} catch (error) {
    console.log(error.message);
    res.status(500).send("Some error occurred");
}
})
module.exports = router;
