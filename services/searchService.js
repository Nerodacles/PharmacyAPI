const Model = require('../models/model.js')
const tagsModel = require('../models/tagsModel.js')

async function searchDrugsByTag(tags) {
    tags = tags.map(tag => tag.toLowerCase())
    const drugs = await Model.find({ tags: { $in: tags } });
    let drugsArray = new Array();

    if (!drugs) { throw 'Drugs not found'; }
    if (drugs.length > 2) {
        for (let i = 0; i < drugs.length; i++) {
            if (JSON.stringify(drugs[i].tags.sort())==JSON.stringify(tags.sort())){
                drugsArray.push(drugs[i].toJSON())
            }
        }
        return drugsArray;
    }
    return drugs.map(drug => drug.toJSON())
}

async function searchDrugsByName(name) {
    name = name.toLowerCase()
    const drugs = await Model.find({ name: { $regex: name, $options: 'i' } });
    if (!drugs) { throw 'Drugs not found'; }
    return drugs.map(drug => drug.toJSON())
}

module.exports = {
    searchDrugsByTag,
    searchDrugsByName,
};