const Model = require('../models/model.js')
const tagsService = require('../services/tagsService.js')

async function modifyTags(drugID, tags) {
    const drug = await Model.findById(drugID);
    tags = tags.map(tag => tag.toLowerCase())
    for (let i = 0; i < tags.length; i++) {
        if (!drug.tags.includes(tags[i])) { 
            await tagsService.modifyTagsDB(tags[i])
            drug.tags.push(tags[i])
        }
        else{ drug.tags.splice(drug.tags.indexOf(tags[i]), 1) }
    }
    await drug.save();
    return drug.toJSON()
}

async function getCoverImage(id) {
    const drug = await Model.findById(id);
    if (!drug) { throw 'Drug not found'; }
    return drug.cover;
}

module.exports = {
    modifyTags,
    getCoverImage,
};