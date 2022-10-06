const Model = require('../models/model.js')
const tagsModel = require('../models/tagsModel.js')

async function searchDrugsByTag(tags) {
    tags = tags.map(tag => tag.toLowerCase())
    const drugs = await Model.find({ tags: { $in: tags } });
    let drugsArray = new Array();

    if (!drugs) { throw new Error('Drugs not found'); }
    if (tags.length >= 2) {
        let drug = "";
        for (drug of drugs) { if (tags.every(tag => drug.tags.includes(tag))) { drugsArray.push(drug) }}
        if (drugsArray.length == 0) { throw new Error('Drugs not found') }
        
        return drugsArray;
    }
    return drugs.map(drug => drug.toJSON())
}

async function searchDrugsByName(name) {
    name = name.toLowerCase()
    const drugs = await Model.find({ name: { $regex: name, $options: 'i' } });
    if (!drugs) { throw new Error('Drugs not found'); }
    if (drugs.length == 0) { throw new Error('Drugs not found'); }
    return drugs.map(drug => drug.toJSON())
}

module.exports = {
    searchDrugsByTag,
    searchDrugsByName,
};