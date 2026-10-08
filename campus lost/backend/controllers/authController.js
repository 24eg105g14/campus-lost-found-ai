const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validateAnuragEmail, parseAnuragEmail } = require('../utils/emailParser');
const { JWT_SECRET } = require('../middleware/auth');

exports.register = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All required fields (name, email, password) must be provided.' });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Enforce Anurag University institutional email format
    if (!validateAnuragEmail(normalizedEmail)) {
      return res.status(400).json({
        message: 'Only valid Anurag University institutional accounts can register. Format: YYegDDDCRR@anurag.edu.in'
      });
    }

    // Check existing user
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this institutional email already exists.' });
    }

    // Parse email parameters (batch, dept, section, roll number)
    const emailDetails = parseAnuragEmail(normalizedEmail);

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = new User({
      name: name.trim(),
      email: normalizedEmail,
      batchYear: emailDetails.batchYear,
      departmentCode: emailDetails.departmentCode,
      section: emailDetails.section,
      rollNumber: emailDetails.rollNumber,
      passwordHash,
      role: 'STUDENT'
    });

    await user.save();

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Registration successful!',
      token,
      user: user.toJSON()
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: err.message || 'Server error during registration.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide both college email and password.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({ message: 'Invalid college email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid college email or password.' });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful!',
      token,
      user: user.toJSON()
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login.' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User profile not found.' });
    }
    res.json(user.toJSON());
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching user profile.' });
  }
};
