// const { SlashCommandBuilder } = require('discord.js');
// const fs = require('fs');

// const templatesFile = './data/templates.json';
// let templates = {};
// if (fs.existsSync(templatesFile)) {
//     templates = JSON.parse(fs.readFileSync(templatesFile));
// }

// function saveTemplates() {
//     fs.writeFileSync(templatesFile, JSON.stringify(templates, null, 2));
// }

// module.exports = {
//     data: new SlashCommandBuilder()
//         .setName('borrar_plantilla')
//         .setDescription('Elimina una de tus plantillas')
//         .addStringOption(option =>
//             option.setName('plantilla')
//                 .setDescription('Selecciona una de tus plantillas')
//                 .setRequired(true)
//                 .setAutocomplete(true)
//         ),

//     async autocomplete(interaction) {
//         const userTemplates = templates[interaction.user.id] || {};
//         const focused = interaction.options.getFocused();
//         const filtered = Object.keys(userTemplates).filter(name => name.toLowerCase().includes(focused.toLowerCase()));
//         await interaction.respond(filtered.map(name => ({ name, value: name })));
//     },

//     async execute(interaction) {
//         const templateName = interaction.options.getString('plantilla');

//         if (!templates[interaction.user.id] || !templates[interaction.user.id][templateName]) {
//             return interaction.reply({ content: '❌ Plantilla no encontrada.', ephemeral: true });
//         }

//         delete templates[interaction.user.id][templateName];
//         saveTemplates();

//         interaction.reply(`🗑️ Plantilla **${templateName}** eliminada.`);
//     }
// };


const { SlashCommandBuilder } = require('discord.js');
const { getTemplates, saveTemplates } = require('../utils/templateManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('borrar_plantilla')
        .setDescription('Elimina una de tus plantillas')
        .addStringOption(option =>
            option.setName('plantilla')
                .setDescription('Selecciona una de tus plantillas')
                .setRequired(true)
                .setAutocomplete(true)
        ),

    async autocomplete(interaction) {
        const templates = getTemplates();
        const userTemplates = templates[interaction.user.id] || {};
        const focused = interaction.options.getFocused();
        const filtered = Object.keys(userTemplates).filter(name => name.toLowerCase().includes(focused.toLowerCase()));
        await interaction.respond(filtered.map(name => ({ name, value: name })));
    },

    async execute(interaction) {
        const templates = getTemplates();
        const userId = interaction.user.id;
        const templateName = interaction.options.getString('plantilla');

        if (!templates[userId] || !templates[userId][templateName]) {
            return interaction.reply({ content: '❌ Plantilla no encontrada.', ephemeral: true });
        }

        delete templates[userId][templateName];
        saveTemplates(templates);

        interaction.reply(`🗑️ Plantilla **${templateName}** eliminada.`);
    }
};
