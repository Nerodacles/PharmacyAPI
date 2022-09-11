const Model = require('../models/model.js')
const tagsModel = require('../models/tagsModel.js')

async function modifyTagsDB(tag) {
    const tagExists = await tagsModel.findOne({ name: tag });
    if (!tagExists) {
        const newTag = new tagsModel({ name: tag });
        await newTag.save();
    }
}

async function getTags() {
    const tags = await tagsModel.find({});
    return tags.map(tag => tag.toJSON());
}

async function deleteTag(tag) {
    await tagsModel.deleteOne({ name: tag })
}

module.exports = {
    modifyTagsDB,
    getTags,
    deleteTag,
};