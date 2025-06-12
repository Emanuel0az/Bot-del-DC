// const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
// const fs = require('fs');

// const templatesFile = './data/templates.json';
// let templates = {};
// if (fs.existsSync(templatesFile)) {
//     templates = JSON.parse(fs.readFileSync(templatesFile));
// }

// module.exports = {
//     data: new SlashCommandBuilder()
//         .setName('actividad')
//         .setDescription('Inicia una actividad con una plantilla existente')
//         .addStringOption(option =>
//             option.setName('plantilla')
//                 .setDescription('Nombre de la plantilla')
//                 .setRequired(true)
//                 .setAutocomplete(true)
//         )
//         .addStringOption(option =>
//             option.setName('tiempo')
//                 .setDescription('Tiempo para comenzar la actividad (ej: 10m, 1h)')
//                 .setRequired(false)
//         ),

//     async execute(interaction) {
//         const userId = interaction.user.id;
//         const templateName = interaction.options.getString('plantilla');
//         const tiempo = interaction.options.getString('tiempo') || 'sin especificar';

//         const userTemplates = templates[userId];
//         if (!userTemplates || !userTemplates[templateName]) {
//             return interaction.reply({ content: `❌ No tienes una plantilla llamada **${templateName}**.`, ephemeral: true });
//         }

//         const roles = userTemplates[templateName];

//         const embed = new EmbedBuilder()
//             .setTitle(`Actividad: ${templateName}`)
//             .setDescription(`Iniciada por <@${userId}> - Comienza en: **${tiempo}**`)
//             .setColor('Blue');

//         Object.entries(roles).forEach(([role, count]) => {
//             embed.addFields({ name: `${role} (${count} cupos)`, value: '—', inline: true });
//         });

//         const selectMenu = new StringSelectMenuBuilder()
//             .setCustomId(`join_activity_${interaction.id}`)
//             .setPlaceholder('Selecciona un rol para unirte')
//             .addOptions(
//                 Object.keys(roles).map(role => ({
//                     label: role,
//                     value: role,
//                 }))
//             );

//         const row = new ActionRowBuilder().addComponents(selectMenu);

//         const activityMessage = await interaction.reply({
//             embeds: [embed],
//             components: [row],
//             fetchReply: true,
//         });

//         interaction.client.activities = interaction.client.activities || {};
//         interaction.client.activities[activityMessage.id] = {
//             creator: userId,
//             templateName,
//             roles,
//             participantsByRole: {},
//         };
//     },

//     // Autocompletado dinámico de plantillas
//     async autocomplete(interaction) {
//         const userId = interaction.user.id;
//         const focused = interaction.options.getFocused();
//         const userTemplates = templates[userId] || {};

//         const filtered = Object.keys(userTemplates).filter(name =>
//             name.toLowerCase().includes(focused.toLowerCase())
//         );

//         await interaction.respond(
//             filtered.map(name => ({
//                 name,
//                 value: name,
//             }))
//         );
//     },
// };


// const {
//   SlashCommandBuilder,
//   EmbedBuilder,
//   ActionRowBuilder,
//   StringSelectMenuBuilder,
// } = require('discord.js');
// const { getTemplates } = require('../utils/templateManager'); // 👈 Importación correcta

// module.exports = {
//   data: new SlashCommandBuilder()
//     .setName('actividad')
//     .setDescription('Inicia una actividad con una plantilla existente')
//     .addStringOption(option =>
//       option.setName('plantilla')
//         .setDescription('Nombre de la plantilla')
//         .setRequired(true)
//         .setAutocomplete(true)
//     )
//     .addStringOption(option =>
//       option.setName('tiempo')
//         .setDescription('Tiempo para comenzar la actividad (ej: 10m, 1h)')
//         .setRequired(false)
//     ),

//   async execute(interaction) {
//     const templates = getTemplates(); // ✅ Cargar siempre la última versión
//     const userId = interaction.user.id;
//     const templateName = interaction.options.getString('plantilla');
//     const tiempo = interaction.options.getString('tiempo') || 'sin especificar';

//     const userTemplates = templates[userId];
//     if (!userTemplates || !userTemplates[templateName]) {
//       return interaction.reply({
//         content: `❌ No tienes una plantilla llamada **${templateName}**.`,
//         ephemeral: true,
//       });
//     }

//     const roles = userTemplates[templateName];

//     const embed = new EmbedBuilder()
//       .setTitle(`Actividad: ${templateName}`)
//       .setDescription(`Iniciada por <@${userId}> - Comienza en: **${tiempo}**`)
//       .setColor('Blue');

//     Object.entries(roles).forEach(([role, count]) => {
//       embed.addFields({ name: `${role} (${count} cupos)`, value: '—', inline: true });
//     });

//     const selectMenu = new StringSelectMenuBuilder()
//       .setCustomId(`join_activity_${interaction.id}`)
//       .setPlaceholder('Selecciona un rol para unirte')
//       .addOptions(
//         Object.keys(roles).map(role => ({
//           label: role,
//           value: role,
//         }))
//       );

//     const row = new ActionRowBuilder().addComponents(selectMenu);

//     const activityMessage = await interaction.reply({
//       embeds: [embed],
//       components: [row],
//       fetchReply: true,
//     });

//     // Guardar la actividad en memoria
//     interaction.client.activities = interaction.client.activities || {};
//     interaction.client.activities[activityMessage.id] = {
//       creator: userId,
//       templateName,
//       roles,
//       participantsByRole: {},
//     };
//   },

//   // Autocompletado dinámico de plantillas
//   async autocomplete(interaction) {
//     const templates = getTemplates(); // ✅ Obtener plantillas actualizadas
//     const userId = interaction.user.id;
//     const focused = interaction.options.getFocused();
//     const userTemplates = templates[userId] || {};

//     const filtered = Object.keys(userTemplates).filter(name =>
//       name.toLowerCase().includes(focused.toLowerCase())
//     );

//     await interaction.respond(
//       filtered.map(name => ({
//         name,
//         value: name,
//       }))
//     );
//   },
// };



const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
} = require('discord.js');
const { getTemplates } = require('../utils/templateManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('actividad')
    .setDescription('Inicia una actividad con una plantilla existente')
    .addStringOption(option =>
      option.setName('plantilla')
        .setDescription('Nombre de la plantilla')
        .setRequired(true)
        .setAutocomplete(true)
    )
    .addStringOption(option =>
      option.setName('tiempo')
        .setDescription('Tiempo para comenzar la actividad (ej: 10m, 1h)')
        .setRequired(false)
    ),

  async execute(interaction) {
    const templates = getTemplates(); // Siempre actualiza
    const userId = interaction.user.id;
    const templateName = interaction.options.getString('plantilla');
    const tiempo = interaction.options.getString('tiempo') || 'sin especificar';

    const userTemplates = templates[userId];
    if (!userTemplates || !userTemplates[templateName]) {
      return interaction.reply({
        content: `❌ No tienes una plantilla llamada **${templateName}**.`,
        ephemeral: true,
      });
    }

    const roles = userTemplates[templateName];

    const embed = new EmbedBuilder()
      .setTitle(`Actividad: ${templateName}`)
      .setDescription(`Iniciada por <@${userId}> - Comienza en: **${tiempo}**`)
      .setColor('Blue');

    Object.entries(roles).forEach(([role, count]) => {
      embed.addFields({
        name: `${String(role)} (${String(count)} cupos)`,
        value: '—',
        inline: true,
      });
    });

    const selectMenu = new StringSelectMenuBuilder()
  .setCustomId(`join_activity_${interaction.id}`)
  .setPlaceholder('Selecciona un rol para unirte')
  .addOptions([
    // Roles dinámicos
    ...Object.entries(roles).map(([role]) => ({
      label: String(role),
      value: String(role),
    })),
    // Opción cancelar
    {
      label: '❌ Cancelar participación',
      value: 'cancelar',
      description: 'Salirte de la actividad y liberar tu cupo',
    },
  ]);


    const row = new ActionRowBuilder().addComponents(selectMenu);

    const activityMessage = await interaction.reply({
      embeds: [embed],
      components: [row],
      fetchReply: true,
    });

    interaction.client.activities = interaction.client.activities || {};
    interaction.client.activities[activityMessage.id] = {
      creator: userId,
      templateName,
      roles,
      participantsByRole: {},
    };
  },

  async autocomplete(interaction) {
    const templates = getTemplates();
    const userId = interaction.user.id;
    const focused = interaction.options.getFocused();
    const userTemplates = templates[userId] || {};

    const filtered = Object.keys(userTemplates).filter(name =>
      name.toLowerCase().includes(focused.toLowerCase())
    );

    await interaction.respond(
      filtered.map(name => ({
        name,
        value: name,
      }))
    );
  },
};
