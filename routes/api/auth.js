const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../models/Users');
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");
const config = require("config");
const bcrypt = require("bcryptjs");

// @route   GET api/auth
// @desc    Test route
// @access  public
router.get('/', auth, async (req,res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).send('Server error!');
    }
});

// @route   POST api/auth
// @desc    Login user & get token
// @access  public
router.post(
    "/",
    [
      check("email", "Please include a valid email").isEmail(),
      check(
        "password",
        "Password is required"
      ).exists()

    ],
    async (req, res) => {
      // Request Validation
      const err = validationResult(req);
      if (!err.isEmpty()) {
        return res.status(400).json({ errors: err.array() });
      }
  
      const {email, password } = req.body;
      try {
        let user = await User.findOne({ email });
  
        if (!user) {
          return res
            .status(400)
            .json({ errors: [{ msg: "Invalid credentials." }] });
        }
  
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res
            .status(400)
            .json({ errors: [{ msg: "Invalid credentials." }] });  
        }
        
  
  

  
        const payload = {
          user: {
            id: user.id
          }
        };
  
        jwt.sign(
          payload,
          config.get("jwtSecret"),
          { expiresIn: 3600 },
          (err, token) => {
            if (err) throw err;
            res.json({ token });
          }
        );

      } catch (err) {
        console.log(err.message);
        res.status(500).send("Server Error!");
      }
    }
  );

module.exports = router;