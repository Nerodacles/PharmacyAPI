const Model = require('../models/model.js')
const tagsService = require('../services/tagsService.js')
let path = require('path');

async function modifyTags(drugID, tags) {
    let tag = "";
    const drug = await Model.findById(drugID);
    tags = tags.map(tag => tag.toLowerCase())
    for (tag of tags) {
        if (!drug.tags.includes(tag)) { 
            await tagsService.modifyTagsDB(tag)
            drug.tags.push(tag)
        }
        else{ drug.tags.splice(drug.tags.indexOf(tag), 1) }
    }
    await drug.save();
    return drug.toJSON()
}

async function getCoverImage(id) {
    const drug = await Model.findById(id);
    if (!drug) { throw new Error('Drug not found'); }
    return drug.cover;
}

async function updateDrug(id, drug, image) {
    let queryDrug = { _id: id.trim().toString() }
    let queryInput = {}
    let tags = null
    if (drug?.tags) { tags = drug?.tags.split(',')}
    const data = await Model.findById(queryDrug);

    if(data === null || !data){ res.status(500).json({message: data}) }
    
    if (drug.name) { queryInput = { ...queryInput, name: drug.name.trim().toString() } }
    if (drug.description) { queryInput = { ...queryInput, description: drug.description.trim().toString() } }
    if (drug.price) { queryInput = { ...queryInput, price: drug.price.trim().toString() } }
    if (drug.tags) { queryInput = { ...queryInput, tags: tags } }
    if (drug?.status == drug?.status) { queryInput = { ...queryInput, status: drug.status } }
    if (drug.stock) { queryInput = { ...queryInput, stock: drug.stock.trim().toString() } }
    if ( image ) { queryInput = { ...queryInput, cover: path.join('pharmacy.jmcv.codes/uploads/' + image.filename.trim()) } }
    
    const updatedDrug = await Model.findOneAndUpdate(queryDrug, queryInput, { new: true });
    if (!updatedDrug) { throw new Error('Drug not found'); }
    return updatedDrug.toJSON();
}

module.exports = {
    modifyTags,
    getCoverImage,
    updateDrug,
};