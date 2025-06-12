// // commands/plantilla.js
// const { SlashCommandBuilder } = require('discord.js');
// const fs = require('fs');
// const path = require('path');

// const templatesPath = path.join(__dirname, '../data/templates.json');

// function loadTemplates() {
//   if (!fs.existsSync(templatesPath)) return {};
//   return JSON.parse(fs.readFileSync(templatesPath));
// }

// function saveTemplates(data) {
//   fs.writeFileSync(templatesPath, JSON.stringify(data, null, 2));
// }

// module.exports = {
//   data: new SlashCommandBuilder()
//     .setName('plantilla')
//     .setDescription('Crear una plantilla de roles con cupos.')
//     .addStringOption(option =>
//       option.setName('nombre')
//         .setDescription('Nombre de la plantilla')
//         .setRequired(true))
//     .addStringOption(option =>
//       option.setName('roles')
//         .setDescription('Lista de roles separados por coma (ej: tank,dps,healer)')
//         .setRequired(true))
//     .addStringOption(option =>
//       option.setName('cupos')
//         .setDescription('Cupos correspondientes separados por coma (ej: 1,5,2)')
//         .setRequired(true)),

//   async execute(interaction) {
//     const nombre = interaction.options.getString('nombre');
//     const rolesInput = interaction.options.getString('roles');
//     const cuposInput = interaction.options.getString('cupos');

//     const roles = rolesInput.split(',').map(r => r.trim());
//     const cupos = cuposInput.split(',').map(n => parseInt(n.trim()));

//     if (roles.length !== cupos.length) {
//       return interaction.reply({
//         content: '❌ El número de roles no coincide con el número de cupos.',
//         ephemeral: true,
//       });
//     }

//     const roleData = {};
//     roles.forEach((role, i) => {
//       roleData[role] = cupos[i];
//     });

//     const templates = loadTemplates();
//     if (!templates[interaction.user.id]) {
//       templates[interaction.user.id] = {};
//     }

//     templates[interaction.user.id][nombre] = roleData;
//     saveTemplates(templates);

//     await interaction.reply(`✅ Plantilla **${nombre}** creada con éxito.`);
//   }
// };



// const { SlashCommandBuilder } = require('discord.js');
// const { getTemplates, saveTemplates } = require('../utils/templateManager');

// module.exports = {
//   data: new SlashCommandBuilder()
//     .setName('plantilla')
//     .setDescription('Crea una plantilla de roles')
//     .addStringOption(option =>
//       option.setName('nombre').setDescription('Nombre de la plantilla').setRequired(true)
//     )
//     .addStringOption(option =>
//       option.setName('roles').setDescription('Roles separados por coma').setRequired(true)
//     )
//     .addStringOption(option =>
//       option.setName('cupos').setDescription('Cupos por rol, separados por coma').setRequired(true)
//     ),

//   async execute(interaction) {
//     const nombre = interaction.options.getString('nombre');
//     const roles = interaction.options.getString('roles').split(',').map(r => r.trim());
//     const cupos = interaction.options.getString('cupos').split(',').map(n => parseInt(n.trim(), 10));

//     if (roles.length !== cupos.length) {
//       return interaction.reply({ content: '❌ El número de roles no coincide con el número de cupos.', ephemeral: true });
//     }

//     const templates = getTemplates();

//     const userId = interaction.user.id;
//     if (!templates[userId]) templates[userId] = {};

//     templates[userId][nombre] = roles.map((rol, index) => ({
//       rol,
//       cantidad: cupos[index],
//     }));

//     saveTemplates(templates);

//     await interaction.reply(`✅ Plantilla "${nombre}" creada con éxito.`);
//   },
// };



// const { SlashCommandBuilder } = require('discord.js');
// const { getTemplates, saveTemplates } = require('../utils/templateManager');

// module.exports = {
//   data: new SlashCommandBuilder()
//     .setName('plantilla')
//     .setDescription('Crea una plantilla de roles')
//     .addStringOption(option =>
//       option.setName('nombre').setDescription('Nombre de la plantilla').setRequired(true)
//     )
//     .addStringOption(option =>
//       option.setName('roles').setDescription('Roles separados por coma').setRequired(true)
//     )
//     .addStringOption(option =>
//       option.setName('cupos').setDescription('Cupos por rol, separados por coma').setRequired(true)
//     ),

//   async execute(interaction) {
//     const nombre = interaction.options.getString('nombre');
//     const roles = interaction.options.getString('roles').split(',').map(r => r.trim());
//     const cupos = interaction.options.getString('cupos').split(',').map(n => parseInt(n.trim(), 10));

//     if (roles.length !== cupos.length) {
//       return interaction.reply({ content: '❌ El número de roles no coincide con el número de cupos.', ephemeral: true });
//     }

//     const templates = getTemplates();
//     const userId = interaction.user.id;
//     if (!templates[userId]) templates[userId] = {};

//     // ✅ Guardar como objeto: { "Tanque": 2, "Healer": 1, "DPS": 3 }
//     const plantilla = {};
//     roles.forEach((rol, i) => {
//       plantilla[rol] = cupos[i];
//     });

//     templates[userId][nombre] = plantilla;
//     saveTemplates(templates);

//     await interaction.reply(`✅ Plantilla "${nombre}" creada con éxito.`);
//   },
// };


const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getTemplates, saveTemplates } = require('../utils/templateManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('plantilla')
    .setDescription('Crea una plantilla de roles')
    .addStringOption(option =>
      option.setName('nombre').setDescription('Nombre de la plantilla').setRequired(true)
    )
    .addStringOption(option =>
      option.setName('roles').setDescription('Roles separados por coma (ej: Tanque,Healer,DPS)').setRequired(true)
    )
    .addStringOption(option =>
      option.setName('cupos').setDescription('Cupos por rol separados por coma (ej: 1,2,3)').setRequired(true)
    ),

  async execute(interaction) {
    const nombre = interaction.options.getString('nombre');
    const roles = interaction.options.getString('roles').split(',').map(r => r.trim());
    const cupos = interaction.options.getString('cupos').split(',').map(n => parseInt(n.trim(), 10));

    // Validación básica
    if (roles.length !== cupos.length) {
      return interaction.reply({ content: '❌ El número de roles no coincide con el número de cupos.', ephemeral: true });
    }

    if (cupos.some(c => isNaN(c) || c < 1)) {
      return interaction.reply({ content: '❌ Todos los cupos deben ser números enteros mayores a cero.', ephemeral: true });
    }

    const roleSet = new Set();
    for (const rol of roles) {
      if (roleSet.has(rol.toLowerCase())) {
        return interaction.reply({ content: `❌ Rol duplicado: **${rol}**.`, ephemeral: true });
      }
      roleSet.add(rol.toLowerCase());
    }

    const templates = getTemplates();
    const userId = interaction.user.id;
    if (!templates[userId]) templates[userId] = {};

    // Confirmar si ya existe
    const existed = !!templates[userId][nombre];

    // Guardar como objeto
    const plantilla = {};
    roles.forEach((rol, i) => {
      plantilla[rol] = cupos[i];
    });

    templates[userId][nombre] = plantilla;
    saveTemplates(templates);

    // Resumen bonito
    const embed = new EmbedBuilder()
      .setTitle(`✅ Plantilla "${nombre}" ${existed ? 'actualizada' : 'creada'} con éxito`)
      .setColor('Green')
      .setDescription(`Roles y cupos:`);

    Object.entries(plantilla).forEach(([rol, cantidad]) => {
      embed.addFields({ name: rol, value: `${cantidad} cupo(s)`, inline: true });
    });

    await interaction.reply({ embeds: [embed] });
  },
};
