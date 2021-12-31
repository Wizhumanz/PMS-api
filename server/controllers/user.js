const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../models/user')
const bcrypt = require('bcryptjs')
require("dotenv").config()

const emailController = require('../controllers/email');

module.exports = {
  signUp: async (req, res) => {
    const user = new User({
      username: req.body.username,
      email: req.body.email,
      password: await bcrypt.hash(req.body.password, 10),
      })
      const token = jwt.sign(
        {
          _id: user._id.toString()
        },
        process.env.JWT_SECRET
      )
      try {
        await user.save()
        let {password, ...userWithoutPw} = user._doc
        return res.status(200).send({message: {
          ...userWithoutPw,
          jwt: token,
        }})
      } catch (err) {
        return res.status(400).json({
            status: 400,
            message: err.name,
        })
      }
  },

  signIn: async (req, res) => {
    try {
      const user = await User.findOne({ username: req.body.username })

      if (!user) {
        return res.status(404).send({ message: 'User Not found.' })
      }

      const passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      )
      if (!passwordIsValid) {
        return res.status(401).send({
            accessToken: null,
            message: 'Invalid password!',
        })
      }
      const token = jwt.sign(
        {
          _id: user._id.toString()
        },
        process.env.JWT_SECRET
      )

      let {password, ...userWithoutPw} = user._doc
      return res.status(200).send({
        ...userWithoutPw,
        jwt: token,
      })
    } catch (error) {
      return res.status(500).send({ message: error }) 
    }
  },

  passwordReset: async (req, res) => {
    try {
      const user = await User.findOne({ email: req.body.email });
      if (!user) return res.status(400).send({message: "User not found"});
            
      const token = jwt.sign({_id: user._id.toString()}, process.env.JWT_SECRET, {expiresIn: '5m'})
      const link = `${process.env.WEBAPP_URL}/reset?token=${token}`;
      // const link = `${process.env.BASE_URL}/reset?token=${token}`;
      await emailController.sendEmail(user.email, "Reset Password", link, res);

      res.status(200).send({message: "password reset link sent to your email account"});
    } catch (error) {
        res.status(400).send({mesage: "An error occurred"});
    }
  },

  verfiyPasswordReset: async (req, res) => {
      try {
        const token = req.query.token
        const decodePayload = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findOne({_id: decodePayload._id})
        if (!user) return res.status(401).send({message: "Invalid link or expired"});

        user.password = await bcrypt.hash(req.body.password, 10);
        await user.save();

        let {password, ...userWithoutPw} = user._doc
        return res.status(200).send({message: {
          ...userWithoutPw,
        }});
      } catch (error) {
          res.status(400).send({message: "Invalid link or expired"});
     }
  },

  emailVerify: async (req, res) => {
    try {
      const user = await User.findOne({ username: req.body.username });
      if (!user) return res.status(400).send({message: "User not found"});

      // FOR CHANGING EMAIL IN SETTINGS: Verify that the new email isn't already being used
      if (user.email !== req.body.email) {
        if (await User.findOne({ email: req.body.email })) {
          return res.status(400).send({message: "This email is already being used!"});
        }
      }

      const token = jwt.sign({_id: user._id.toString()}, process.env.JWT_SECRET, {expiresIn: '5m'})
      const link = `${process.env.WEBAPP_URL}/email-verification?email=${req.body.email}&token=${token}`;
      // const link = `${process.env.BASE_URL}/email-verification?email=${req.body.email}&token=${token}`;
      emailController.sendEmail(req.body.email, "Email Verification", link, res);
  
      res.status(200).send({message: "Email verification link sent to your email account"});
    } catch (error) {
        res.status(400).send({message: "An error occurred"});
    }
  },
  
  confirmEmailVerify: async (req, res) => {
    try {
      const token = req.body.token
      const decodePayload = jwt.verify(token, process.env.JWT_SECRET)
      const user = await User.findOne({_id: decodePayload._id})
      if (!user) return res.status(401).send("Invalid link or expired");

      user.email = req.body.email;
      user.verified = true;
      await user.save();

      let {password, ...userWithoutPw} = user._doc
      res.status(200).send({message: {
        ...userWithoutPw,
      }});
    } catch (error) {
        res.status(400).send({message: "Invalid link or expired"});
    }
  },
  
  getProfile: async (req, res) => {
    try {
      const user = await User.findOne({_id: req.authUser._id})
      res.status(200).send({user: user});
    } catch(error) {
        res.status(400).send({message: "An error occurred"});
    }
  },
  
  updateProfile: async (req,res) => {
    try{
      const user = await User.findOneAndUpdate({_id: req.authUser._id}, {$set: req.body}, {new: true})
      res.status(200).send({user: user});
    } catch(error) {
      res.status(400).send({message: "An error occurred"});
    }
  },

  changePassword: async (req,res) => {
    try{
      const user = await User.findOne({_id: req.authUser._id})
      const verifyPassword = bcrypt.compareSync(req.body.oldPassword, user.password)
      if(!verifyPassword) return res.status(401).send({message: "Invalid password!"});

      user.password = await bcrypt.hash(req.body.newPassword, 10),
      await user.save()
      res.status(200).send({message: "password updated successfully"});
    } catch(error) {
        res.status(400).send({message: error});
    }
  },

  validateToken: async (req,res) => {
    try{
      res.status(200).send({message: 'Valid user token'});
    } catch(error) {
        res.send({message: error});
    }
  }
}
