const { json } = require('body-parser');
var express = require('express');
var router = express.Router();
const Model = require('../models/model');
const path = require('path');

/* GET home page. */
router.get('/', function(req, res, next) {
    var ip = req.headers['x-forwarded-for'].split(',')[0]
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
*       - ApiKeyAuth: []
*     parameters:
*       - in: body
*         name: drug
*         description: name of the drug
*         schema:
*           type: object
*           required:
*             - name
*           properties:
*             name:
*               type: string
*     responses:
*       200:
*         description: Drug created
*       400:
*         description: Bad request
*       401:
*         description: Unauthorized
*/

//Post Method
router.post('/post', async (req, res) => {
    const apiKey = req.get('API-Key')
    if (!apiKey || apiKey !== process.env.API_KEY) {
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
*       400:
*         description: Bad request
*       401:
*         description: Unauthorized
*/

//Get all Method
router.get('/getAll', async (req, res) => {
    try{
        const data = await Model.find();
        res.json(data)
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
*     responses:
*       200:
*         description: Drug is found
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
        const data = await Model.findById(req.params.id);
        if(data === null){
            res.status(500).json({message: data})
        }
        else{
            res.json(data)
        }
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
*       - ApiKeyAuth: []
*     summary: Update a Drug
*     description: Update a drug
*     parameters:
*       - in: body
*         name: drug
*         description: name of the drug
*         schema:
*           type: object
*           required:
*             - name
*           properties:
*             name:
*               type: string
*       - in: path
*         name: id
*         description: Drug id
*         required:
*           - id
*         properties:
*           id:
*             type: string
*     responses:
*       200:
*         description: Drug updated
*       400:
*         description: Bad request
*       401:
*         description: Unauthorized
*       500:
*         description: Drug not found
*/

//Update by ID Method
router.patch('/update/:id', async (req, res) => {
    const apiKey = req.get('API-Key')
    if (!apiKey || apiKey !== process.env.API_KEY) {
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
            res.send(result)
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
*       - ApiKeyAuth: []
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
*     responses:
*       200:
*         description: Drug deleted
*       400:
*         description: Bad request
*       401:
*         description: Unauthorized
*/

//Delete by ID Method
router.delete('/delete/:id', async (req, res) => {
    const apiKey = req.get('API-Key')
    if (!apiKey || apiKey !== process.env.API_KEY) {
        res.status(401).json({error: 'unauthorised'})
    } 
    else {
        try {
            const id = req.params.id;
            console.log(req.params.id)
            const data = await Model.findByIdAndDelete(id)
            res.send(`The drug "${data.name}" has been deleted..`)
        }
        catch (error) {
            res.status(400).json({ message: error.message })
        }
    }
})

module.exports = router;
module.exports.Model = Model;