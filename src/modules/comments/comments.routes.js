const express = require('express');
const controller = require('./comments.controller');

const router = express.Router({ mergeParams: true });

router.get('/', controller.listByPost);
router.post('/', controller.create);

module.exports = router;
