const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const registerUser = async (req, res) => {
  try {

    console.log("========== REGISTER REQUEST ==========");
    console.log("Request Body:", req.body);

    const { name, email, password } = req.body;

    console.log("Name:", name);
    console.log("Email:", email);
    console.log("Password:", password);

    const existingUser = await User.findOne({ email });

    if (existingUser) {

      console.log("User already exists");

      return res.status(400).json({
        message: "User already exists"
      });

    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    console.log("Hashed Password:", hashedPassword);

    const user = new User({
      name,
      email,
      password: hashedPassword
    });

    await user.save();

    console.log("User saved successfully");
    console.log(user);

    res.status(201).json({
      message: "User Registered Successfully"
    });

  } catch (error) {

    console.log("REGISTER ERROR");
    console.log(error);

    res.status(500).json({
      message: error.message
    });

  }
};


const loginUser = async (req, res) => {
  try {

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "User not found"
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid Password"
      });
    }

    const token = jwt.sign(
      { id: user._id },
      "skillswapsecret",
      { expiresIn: "7d" }
    );

   res.status(200).json({
  message: "Login Successful",
  token,
  userId: user._id,
  name: user.name,
  email: user.email
});

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};

module.exports = {
  registerUser,
  loginUser
};