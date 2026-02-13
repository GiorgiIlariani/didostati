const express = require('express');
const router = express.Router();

// Cart routes (to be implemented)
router.get('/', (req, res) => {
  res.json({ status: 'success', data: { cart: { items: [], total: 0 } } });
});

module.exports = router;
