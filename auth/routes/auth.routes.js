const express = require('express')
const router = express.router();
const controller = require("../controllers/auth.controller");


router.post('/register',controller.register);
router.post('/login', controller.login);

module.exports = router

