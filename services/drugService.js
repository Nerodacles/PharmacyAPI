const Model = require('../models/model.js')
const tagsService = require('../services/tagsService.js')

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

module.exports = {
    modifyTags,
    getCoverImage,
};