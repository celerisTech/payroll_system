const express = require('express');
const router = express.Router();
const controller = require('../controllers/BankDetailsController');

router.get('/', controller.getAllBankDetails);

module.exports = router;