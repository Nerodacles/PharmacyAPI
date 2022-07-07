const { json } = require('body-parser');
var express = require('express');
var router = express.Router();
const Model = require('../models/model');
const auth = require('../helpers/jwt');

/* GET home page. */
router.get('/', function(req, res, next) {
    var ip = req.headers['x-forwarded-for'].split(',')[0]
    // res.sendFile(path.join(__dirname+'/api/index.html'));
    res.redirect('/docs')
    console.log(ip || req.socket.remoteAddress)
});

/**
* @swagger
* /api/post:
*   post:
*     tags:
*       - Drugs
*     summary: Create a Drug
*     description: Create a drug
*     security:
*       - ApiKeyDef: []
*     parameters:
*       - in: body
*         name: drug
*         description: name of the drug
*         required: true
*         schema:
*           type: object
*           required:
*             - name
*           properties:
*             name:
*               type: string
*               description: Name of the drug
*     responses:
*       200:
*         description: Drug created
*         schema:
*           type: object
*           properties:
*             name:
*               type: string
*               description: Name of the drug
*             id:
*               type: string
*               description: Id of the drug
*           example:
*             - id: 62ae1de392d3f0b8a6
*               name: Aspirina
*       400:
*         description: Bad request
*       401:
*         description: Unauthorized
*/

//Post Method
router.post('/post', async (req, res) => {
    const token = req.headers['api-key'];
    if (!token || token !== process.env.API_KEY) {
        res.status(401).json({error: 'unauthorised'})
      } 
    else {
        const drugs = new Model({
            name: req.body.name,
        })
        try {
            const dataToSave = await drugs.save();
            res.status(200).json(dataToSave)
        }
        catch (error) {
            res.status(400).json({message: error.message})
        }
    }
})

/**
* @swagger
* /api/getAll:
*   get:
*     tags:
*       - Drugs
*     security: []
*     summary: Get all Drugs
*     description: Get all drugs
*     produces:
*       - application/json
*     responses:
*       200:
*         description: Drugs Found
*         schema:
*           type: object
*           properties:
*             name:
*               type: string
*               description: Name of the drug
*             id:
*               type: string
*               description: Id of the drug
*           example:
*             - id: 62ae1de392d3f0b8a6
*               name: Aspirina
*             - id: 62ae1de392d3f0b8a7
*               name: Omeprazol
*       400:
*         description: Bad request
*       401:
*         description: Unauthorized
*/

//Get all Method
router.get('/getAll', async (req, res) => {
    try{
        // if ( req.headers['api-key'] === process.env.API_KEY || auth.verifyToken(req.headers.authorization) ) {
            const data = await Model.find();
            res.json(data)
        // }
        // else {
            // res.status(401).json({error: 'unauthorised'})
        // }
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

/**
* @swagger
* /api/getOne/{id}:
*   get:
*     tags:
*       - Drugs
*     security: []
*     summary: Get one Drug
*     description: Get one drug
*     produces:
*       - application/json
*     parameters:
*       - in: path
*         name: id
*         description: Drug id
*         required:
*           - id
*         properties:
*           id:
*             type: string
*             description: Id of the drug
*     responses:
*       200:
*         description: Drug is found
*         schema:
*           type: object
*           properties:
*             name:
*               type: string
*               description: Name of the drug
*             id:
*               type: string
*               description: Id of the drug
*           example:
*             - id: 62ae1de392d3f0b8a6
*               name: Aspirina
*       400:
*         description: Bad request
*       401:
*         description: Unauthorized
*       500:
*         description: Drug is not found
*/

//Get by ID Method
router.get('/getOne/:id', async (req, res) => {
    try{
        // if (req.headers['api-key'] === process.env.API_KEY || auth.verifyToken(req.headers.authorization)) {
            const data = await Model.findById(req.params.id);
            if(data === null){
                res.status(500).json({message: data})
            }
            else{
                res.json(data)
            }
        // }
        // else {
            // res.status(401).json({error: 'unauthorised'})
        // }
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

/**
* @swagger
* /api/update/{id}:
*   patch:
*     tags:
*       - Drugs
*     security:
*       - ApiKeyDef: []
*     summary: Update a Drug
*     description: Update a drug
*     parameters:
*       - in: body
*         name: drug
*         description: name of the drug
*         required: true
*         schema:
*           type: object
*           required:
*             - name
*           properties:
*             name:
*               type: string
*               description: Name of the drug
*       - in: path
*         name: id
*         description: Drug id
*         required:
*           - id
*         properties:
*           id:
*             type: string
*             description: Id of the drug
*     responses:
*       200:
*         description: Drug updated
*         schema:
*           type: object
*           properties:
*             name:
*               type: string
*               description: Name of the drug
*             id:
*               type: string
*               description: Id of the drug
*           example:
*             id: 62ae1de392d3f0b8a6
*             name: Aspirina
*       400:
*         description: Bad request
*       401:
*         description: Unauthorized
*       500:
*         description: Drug not found
*/

//Update by ID Method
router.patch('/update/:id', async (req, res) => {
    const token = req.headers['api-key'];
    if (!token || token !== process.env.API_KEY) {
        res.status(401).json({error: 'unauthorised'})
    }   
    else {
        try {
            const id = req.params.id;
            const updatedData = req.body;
            const options = { new: true };
            const result = await Model.findByIdAndUpdate(
                id, updatedData, options
            )
            res.end(escapeHtml(result))
        }
        catch (error) {
            res.status(400).json({ message: error.message })
        }
    }
})

/**
* @swagger
* /api/delete/{id}:
*   delete:
*     tags:
*       - Drugs
*     security:
*       - ApiKeyDef: []
*     summary: Delete a Drug
*     description: Delete a drug
*     produces:
*       - application/json
*     parameters:
*       - in: path
*         name: id
*         description: Drug id
*         required:
*           - id
*         properties:
*           id:
*             type: string
*             description: Id of the drug
*     responses:
*       200:
*         description: Drug deleted
*         schema:
*           type: string
*           example: The drug 'Omeprazol' has been deleted
*       400:
*         description: Bad request
*       401:
*         description: Unauthorized
*/

//Delete by ID Method
router.delete('/delete/:id', async (req, res) => {
    const token = req.headers['api-key'];
    if (!token || token !== process.env.API_KEY) {
        res.status(401).json({error: 'unauthorised'})
    } 
    else {
        try {
            const id = req.params.id;
            console.log(req.params.id)
            const data = await Model.findByIdAndDelete(id)
            res.end('The drug has been deleted.' + escapeHtml(data.name))
        }
        catch (error) {
            res.status(400).json({ message: error.message })
        }
    }
})

module.exports = router;
module.exports.Model = Model;