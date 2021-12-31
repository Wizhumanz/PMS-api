const express = require('express')
const auth = require('../middlewares/auth')
const usersCtrl = require('../controllers/user');
const router = new express.Router()

router.post('/api/user/signup', async (req, res) => {
  usersCtrl.signUp(req, res);
})

router.post('/api/user/signin', async (req, res) => {
  usersCtrl.signIn(req,res);
})

router.post('/api/user/password-reset', async (req, res) => {
  usersCtrl.passwordReset(req,res);
})

router.post('/api/user/password-verify', async (req, res) => {
  usersCtrl.verfiyPasswordReset(req,res);
})

router.get('/api/user/profile', auth, async (req, res) => {
  usersCtrl.getProfile(req,res);
})

router.put('/api/user/profile', auth, async (req, res) => {
  usersCtrl.updateProfile(req,res);
})

router.put('/api/user/verify', async (req, res) => {
  usersCtrl.emailVerify(req,res);
})

router.post('/api/user/confirm-verify', async (req, res) => {
  usersCtrl.confirmEmailVerify(req,res);
})

router.put('/api/user/change-password', auth, async (req, res) => {
  usersCtrl.changePassword(req,res);
})

router.post('/api/user/validate-token', auth, async (req, res) => {
  usersCtrl.validateToken(req,res);
})

module.exports = router