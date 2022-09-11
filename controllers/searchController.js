const express = require('express')
const router = express.Router();
const searchService = require('../services/searchService.js')

/**
* @swagger
* /search:
*   post:
*     tags:
*       - Search
*     security: []
*     summary: Search drugs by name
*     description: Search drugs by name
*     produces:
*       - application/json
*     parameters:
*       - name: name
*         in: formData
*         description: Name of the drug
*         required: true
*         type: string
*         default: Omeprazol
*     responses:
*       200:
*         description: Drugs returned
*         schema:
*           type: object
*           properties:
*             name:
*               type: string
*               description: Name of the drug
*             description:
*               type: string
*               description: Description of the drug
*             price:
*               type: number
*               description: Price of the drug
*             tags:
*               type: array
*               items:
*                 type: string
*               description: Tags of the drug
*             id:
*               type: string
*               description: Id of the drug
*             cover:
*               type: file
*               description: Cover art of the drug
*           example:
*             - id: 62ae1de392d3f0b8a6
*               name: Aspirina
*               description: Test
*               price: 200
*               tags: ["dolor de cabeza", "dolor de estomago"]
*               cover: pharmacy.jmcv.codes/uploads/test2.img
*               createdTime: 2022-08-24T23:42:24.084Z
*               
*       400:
*         description: Bad request
*       401:
*         description: Token expired
*/

router.post('/', (req, res, next) => {
    searchService.searchDrugsByName(req.body.name)
        .then(drugs => res.json(drugs))
        .catch(err => next(err))
})

/**
* @swagger
* /search/tags:
*   post:
*     tags:
*       - Search
*     security: []
*     summary: Search drugs by tags
*     description: Search drugs by tags
*     produces:
*       - application/json
*     parameters:
*       - name: tags
*         in: formData
*         description: Tags of the drug
*         required: true
*         type: array
*         items:
*           type: string
*         default: ["dolor de cabeza", "dolor de estomago"]
*     responses:
*       200:
*         description: Drugs returned
*         schema:
*           type: object
*           properties:
*             name:
*               type: string
*               description: Name of the drug
*             description:
*               type: string
*               description: Description of the drug
*             price:
*               type: number
*               description: Price of the drug
*             tags:
*               type: array
*               items:
*                 type: string
*               description: Tags of the drug
*             id:
*               type: string
*               description: Id of the drug
*             cover:
*               type: file
*               description: Cover art of the drug
*           example:
*             - id: 62ae1de392d3f0b8a6
*               name: Aspirina
*               description: Test
*               price: 200
*               tags: ["dolor de cabeza", "dolor de estomago"]
*               cover: pharmacy.jmcv.codes/uploads/test2.img
*               createdTime: 2022-08-24T23:42:24.084Z
*               
*       400:
*         description: Bad request
*       401:
*         description: Token expired
*/

router.post('/tags', (req, res, next) => {
    searchService.searchDrugsByTag(req.body.tags)
        .then(drugs => res.json(drugs))
        .catch(err => next(err))
})

module.exports = router;