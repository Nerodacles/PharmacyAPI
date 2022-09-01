const { json } = require('body-parser');
var express = require('express');
var router = express.Router();
const Model = require('../models/model');
const auth = require('../helpers/jwt');
var multer = require('multer');
let fs = require('fs-extra');
var path = require('path');

function generateName(coverName){
    return coverName.trim();
}

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let path = 'uploads';
        fs.mkdirsSync(path);
        cb(null, path) },
    filename: (req, file, cb) => {
        cb(null, generateName(file.originalname)) }
});
var upload = multer({ storage: storage });

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
*       - ApiKeyDef: []
*     consumes:
*       multipart/form-data
*     produces:
*       application/json
*     parameters:
*       - name: name
*         in: formData
*         description: Name of the drug
*         required: true
*         type: string
*         default: Omeprazol
*       - name: description
*         in: formData
*         description: Description of the drug
*         required: true
*         type: string
*         default: El omeprazol se utiliza en el tratamiento de la dispepsia, úlcera péptica, enfermedades por reflujo gastroesofágico y el síndrome de Zollinger-Ellison.
*       - name: cover
*         in: formData
*         type: file
*         description: Cover art for the drug
*     responses:
*       200:
*         description: Drug created
*         schema:
*           type: object
*           properties:
*             name:
*               type: string
*               description: Name of the drug
*             description:
*               type: string
*               description: Description of the drug
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
*               cover: pharmacy.jmcv.codes/uploads/test2.img
*               createdTime: 2022-08-24T23:42:24.084Z
*       400:
*         description: Bad request
*       401:
*         description: Unauthorized
*/

//Post Method
router.post('/post', upload.single('cover'), async (req, res) => {
    const token = req.headers['api-key']; 

    if (!token || token !== process.env.API_KEY) { res.status(401).json({error: 'unauthorised'}) } 
    else {
        const drugs = new Model({
            name: req.body.name,
            description: req.body.description,
            cover: path.join('pharmacy.jmcv.codes/uploads/' + req.file.filename.trim())
        })
        try {
            const dataToSave = await drugs.save();
            res.status(200).json(dataToSave)
        }
        catch (error) { res.status(400).json({message: error.message}) }
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
*             description:
*               type: string
*               description: Description of the drug
*             id:
*               type: string
*               description: Id of the drug
*           example:
*             - id: 62ae1de392d3f0b8a6
*               name: Aspirina
*               description: Test
*               cover: pharmacy.jmcv.codes/uploads/test.img
*               createdTime: 2022-08-24T23:42:24.084Z
*             - id: 62ae1de392d3f0b8a7
*               name: Omeprazol
*               description: Test2
*               cover: pharmacy.jmcv.codes/uploads/test2.img
*               createdTime: 2022-08-24T23:42:24.084Z
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
    catch(error){ res.status(500).json({message: error.message}) }
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
*             description:
*               type: string
*               description: Description of the drug
*             id:
*               type: string
*               description: Id of the drug
*           example:
*             - id: 62ae1de392d3f0b8a6
*               name: Aspirina
*               description: Test
*               cover: pharmacy.jmcv.codes/uploads/test.img
*               createdTime: 2022-08-24T23:42:24.084Z
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
            if(data === null){ res.status(500).json({message: data}) }
            else{ res.json(data) }
        // }
        // else { res.status(401).json({error: 'unauthorised'}) }
    }
    catch(error){ res.status(500).json({message: error.message}) }
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
*       - name: name
*         in: formData
*         description: Name of the drug
*         required: true
*         type: string
*         default: Omeprazol
*       - name: description
*         in: formData
*         description: Description of the drug
*         required: true
*         type: string
*         default: El omeprazol se utiliza en el tratamiento de la dispepsia, úlcera péptica, enfermedades por reflujo gastroesofágico y el síndrome de Zollinger-Ellison.
*       - name: cover
*         in: formData
*         type: file
*         description: Cover art for the drug
*     responses:
*       200:
*         description: Drug updated
*         schema:
*           type: object
*           properties:
*             name:
*               type: string
*               description: Name of the drug
*             description:
*               type: string
*               description: Description of the drug
*             id:
*               type: string
*               description: Id of the drug
*           example:
*             id: 62ae1de392d3f0b8a6
*             name: Aspirina
*             description: Test
*             cover: pharmacy.jmcv.codes/uploads/test.img
*             createdTime: 2022-08-24T23:42:24.084Z
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
            const result = await Model.findByIdAndUpdate( id, updatedData, options )
            res.end(`The drug with id ${id} has been updated`)
        }
        catch (error) { res.status(400).json({ message: error.message }) }
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
    if (!token || token !== process.env.API_KEY) { res.status(401).json({error: 'unauthorised'}) } 
    else {
        try {
            const id = req.params.id;
            console.log(req.params.id)
            const data = await Model.findByIdAndDelete(id)
            res.end(`The drug with id ${id} has been deleted`)
        }
        catch (error) { res.status(400).json({ message: error.message }) }
    }
})

module.exports = router;
module.exports.Model = Model;