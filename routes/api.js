const { json } = require('body-parser');
let express = require('express');
let router = express.Router();
const Model = require('../models/model');
const auth = require('../helpers/jwt');
let multer = require('multer');
let fs = require('fs-extra');
let path = require('path');
let userService = require('../services/userService');
let drugService = require('../services/drugService');

function generateName(coverName){
    return coverName.trim();
}

let storage = multer.diskStorage({
    limits: {fileSize: 1000000},
    destination: (req, file, cb) => {
        let path = 'uploads';
        fs.mkdirsSync(path);
        cb(null, path) },
    filename: (req, file, cb) => {
        cb(null, generateName(file.originalname)) }
});

let upload = multer({ storage: storage, limits: {fileSize: 1000000} });

/* GET home page. */
router.get('/', function(req, res, next) {
    res.redirect('/docs')
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
*       - name: price
*         in: formData
*         description: Price of the drug
*         required: true
*         type: number
*         default: 10
*       - name: tags
*         in: formData
*         description: Tags of the drug
*         required: true
*         type: array
*         items:
*           type: string
*         default: ["dolor de estomago", "dolor de cabeza"]
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
*       400:
*         description: Bad request
*       401:
*         description: Unauthorized
*/

//Post Method
router.post('/post', upload.single('cover'), async (req, res) => {
    let splitTags = [];
    let token = req.headers.authorization
    if (await !userService.checkUserIsAdmin(token)) { res.status(401).json({error: 'unauthorised'}) } 
    else {
        if (req.body.tags) { splitTags = (req.body.tags.split(',') || '').map(tag => tag.trim().toLowerCase()) }
        const drugs = new Model({
            name: req.body.name,
            description: req.body.description,
            stock: req.body.stock,
            cover: path.join('pharmacy.jmcv.codes/uploads/' + req.file?.filename.trim()),
            price: req.body.price,
        })
        try {
            await drugs.save();
            res.status(200).json(await drugService.modifyTags(drugs.id, splitTags));
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
*           example:
*             - id: 62ae1de392d3f0b8a6
*               name: Aspirina
*               description: Test
*               price: 200
*               tags: ["dolor de estomago", "dolor de cabeza"]
*               cover: pharmacy.jmcv.codes/uploads/test.img
*               createdTime: 2022-08-24T23:42:24.084Z
*             - id: 62ae1de392d3f0b8a7
*               name: Omeprazol
*               description: Test2
*               price: 200
*               tags: ["dolor de estomago", "dolor de cabeza"]
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
        let userAdmin = await userService.checkUserIsAdmin(req.headers.authorization);
        if (userAdmin) { return res.status(200).json(await Model.find()) }
        res.json(await Model.find({status: true}))
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
*           example:
*             - id: 62ae1de392d3f0b8a6
*               name: Aspirina
*               description: Test
*               price: 200
*               tags: ["dolor de estomago", "dolor de cabeza"]
*               cover: pharmacy.jmcv.codes/uploads/test.img
*               createdTime: 2022-08-24T23:42:24.084Z
*       400:
*         description: Bad request
*       401:
*         description: Unauthorized
*       500:
*         description: Drug is not found
*/

router.get('/getOne/:id', async (req, res) => {
    try{
        const data = await Model.findById(req.params.id);
        if(data === null){ res.status(500).json({message: data}) }
        if ( req.headers['authorization'] ) {
            return await userService.hasFavorite(req.headers.authorization, req.params.id) ? res.json({data, favorite: true}) : res.json({data, favorite: false})
        }
        res.json({ data, favorite: false })
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
*       - in: path
*         name: id
*         description: Drug id
*         required:
*           - id
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
*       - name: price
*         in: formData
*         description: Price of the drug
*         required: true
*         type: number
*         default: 100
*       - name: tags
*         in: formData
*         description: Tags of the drug
*         required: true
*         type: array
*         items:
*           type: string
*         default: ["dolor de estomago", "dolor de cabeza"]
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
*           example:
*             id: 62ae1de392d3f0b8a6
*             name: Aspirina
*             description: Test
*             price: 200
*             cover: pharmacy.jmcv.codes/uploads/test.img
*             createdTime: 2022-08-24T23:42:24.084Z
*       400:
*         description: Bad request
*       401:
*         description: Unauthorized
*       500:
*         description: Drug not found
*/

router.patch('/update/:id', upload.single('cover'),  (req, res) => {
    let token = req.headers.authorization
    if (!userService.checkUserIsAdmin(token)) { res.status(401).json({error: 'unauthorised'}) }   
    else {
        drugService.updateDrug(req.params.id, req.body, req?.file)
        .then(data => res.json({message: 'Drug updated'}))
        .catch(error => res.status(500).json({message: error.message}))
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

router.delete('/delete/:id', async (req, res) => {
    let token = req.headers.authorization
    let user = await userService.checkUserIsAdmin(token)
    if (!user) { res.status(401).json({error: 'unauthorised'}) } 
    else {
        try {
            const id = req.params.id
            await Model.findByIdAndDelete(id)
            res.end(`The drug has been deleted!`)
        }
        catch (error) { res.status(400).json({ message: error.message }) }
    }
})

/**
* @swagger
* /api/topDrugs:
*   get:
*     tags:
*       - Drugs
*     security: []
*     summary: Get top drugs
*     description: Get top drugs
*     produces:
*       - application/json
*     responses:
*       200:
*         description: Drug is found
*         schema:
*           type: object
*           properties:
*             name:
*               type: string
*               description: Name of the drug
*             total:
*               type: number
*               description: Total of the drug
*           example:
*             name: Omeprazol
*             total: 10
*       400:
*         description: Bad request
*       401:
*         description: Unauthorized
*       500:
*         description: Drug is not found
*/

router.get('/topDrugs', async (req, res) => {
    try {
        drugService.getTopDrugs()
        .then(data => res.json({data}))
        .catch(error => res.status(500).json({message: error.message}))
    }
    catch (error) { res.status(400).json({ message: error.message }) }
})

module.exports = router;