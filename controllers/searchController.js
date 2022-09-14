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
*       500:
*         description: Internal server error
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
*         in: body
*         schema:
*           type: array
*           items:
*             type: string
*           example: ["dolor de cabeza", "dolor de estomago"]
*         required: true
*         description: Tags of the drug
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
*       500:
*         description: Internal server error
*/

router.post('/tags', (req, res, next) => {
    if (req.body?.tags){
        searchService.searchDrugsByTag(req.body.tags)
        .then(drugs => res.json(drugs))
        .catch(err => next(err))
    }
    else{
        searchService.searchDrugsByTag(req.body)
        .then(drugs => res.json(drugs))
        .catch(err => next(err))
    }
})

module.exports = router;