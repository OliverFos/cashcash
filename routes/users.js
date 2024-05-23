const express = require('express');
const router = express.Router();
const db = require('../connect');

router.get('/', (req, res) => {
  const sql = 'SELECT * FROM salarie';
  db.query(sql, (err, data) => {
    if (err) throw err;
    //console.log(data);
    res.render('users', { title: 'User List', userData: data });
  });
});
module.exports = router;