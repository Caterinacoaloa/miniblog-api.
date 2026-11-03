const express = require('express');
const controller = require('./posts.controller');

const router = express.Router();

router.get('/', controller.list);
router.get('/author/:authorId', controller.listByAuthor);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);

module.exports = router;
