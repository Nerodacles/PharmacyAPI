const express = require('express')
const router = express.Router();
const tagsService = require('../services/tagsService.js')

/**
* @swagger
* /tags:
*   get:
*     tags:
*       - Tags
*     security: []
*     summary: Get all tags
*     description: Get all tags
*     produces:
*       - application/json
*     responses:
*       200:
*         description: Tags returned
*         schema:
*           type: object
*           properties:
*             name:
*               type: string
*               description: Tag name
*             id:
*               type: string
*               description: Tag id
*           example:
*             - id: 5f9f9f9f9
*               name: tag1
*             - id: 5f9f9f9f9f9f9f9f9f9f9f9f
*               name: tag2
*               
*       400:
*         description: Bad request
*       401:
*         description: Token expired
*/

router.get('/', (req, res, next) => {
    tagsService.getTags()
        .then(tags => res.json(tags))
        .catch(err => next(err))
})

module.exports = router;