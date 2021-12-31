const jwt = require("jsonwebtoken")
const User = require("../models/user")

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "")
    const decodePayload = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findOne({
      _id: decodePayload._id,
    })

    if (!user) {
      throw new TypeError("user does not exist")
    }
    req.authUser = user
    next()
  } catch (err) {
    return res.status(401).send({ error: "please authenticate" })
  }
}

module.exports = auth
