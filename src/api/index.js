const express = require('express');

const api = require('./api');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    message: 'AllnOne Backend API'
  });
});

router.use('/api/v1', api);

module.exports = router;
