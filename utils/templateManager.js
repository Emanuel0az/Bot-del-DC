const fs = require('fs');
const path = require('path');

const templatesPath = path.join(__dirname, '../data/templates.json');

function getTemplates() {
  try {
    const data = fs.readFileSync(templatesPath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return {};
  }
}

function saveTemplates(templates) {
  fs.writeFileSync(templatesPath, JSON.stringify(templates, null, 2), 'utf8');
}

module.exports = {
  getTemplates,
  saveTemplates,
};
