const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');


const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};


const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Please enter all fields' });
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    username,
    email,
    password: hashedPassword,
  });

  if (user) {

    res.status(201).json({
      _id: user.id,
      username: user.username,
      token: generateToken(user._id),
    });

  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {

    res.json({
      _id: user.id,
      username: user.username,
      totalIncome: user.totalIncome,
      totalExpenses: user.totalExpenses,
      token: generateToken(user._id),
    });

  } else {

    res.status(401).json({ message: 'Invalid credentials. Please check or sign up.' });
  }
};


module.exports = {
  registerUser,
  loginUser,
};