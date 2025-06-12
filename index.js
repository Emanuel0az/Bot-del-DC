// require('dotenv').config();
// const fs = require('fs');
// const { Client, GatewayIntentBits, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');

// const client = new Client({
//     intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
// });

// // Cargar o inicializar las plantillas
// let templates = {};
// const templatesFile = './data/templates.json';
// if (fs.existsSync(templatesFile)) {
//     templates = JSON.parse(fs.readFileSync(templatesFile));
// }

// function saveTemplates() {
//     fs.writeFileSync(templatesFile, JSON.stringify(templates, null, 2));
// }

// client.once('ready', () => {
//     console.log(`✅ Bot listo como ${client.user.tag}`);
// });

// client.login(process.env.DISCORD_TOKEN);

// ///////////////////////////////////////////////////////////////////
// // MANEJADOR DE MENSAJES
// ///////////////////////////////////////////////////////////////////

// client.on('messageCreate', async (message) => {
//     if (message.author.bot) return;

//     const args = message.content.split(' ');
//     const command = args[0];

//     // ------------------------------
//     // GUARDAR PLANTILLA
//     // ------------------------------
//     if (command === '!guardarplantilla') {
//         const templateName = args[1];
//         const rolesInput = args.slice(2).join(' '); // Ej: tank:1,healer:2,dps:3

//         if (!templateName || !rolesInput) {
//             return message.reply('❗ Uso: !guardarplantilla [nombre] [roles:cantidad,roles:cantidad]');
//         }

//         const roles = {};
//         rolesInput.split(',').forEach(pair => {
//             const [role, count] = pair.split(':');
//             roles[role.trim()] = parseInt(count.trim());
//         });

//         if (!templates[message.author.id]) {
//             templates[message.author.id] = {};
//         }

//         templates[message.author.id][templateName] = roles;
//         saveTemplates();

//         message.reply(`✅ Plantilla **${templateName}** guardada para ti.`);
//     }

//     // ------------------------------
//     // ELIMINAR PLANTILLA
//     // ------------------------------
//     if (command === '!eliminarplantilla') {
//         const templateName = args[1];

//         if (!templateName) {
//             return message.reply('❗ Uso: !eliminarplantilla [nombre]');
//         }

//         if (!templates[message.author.id] || !templates[message.author.id][templateName]) {
//             return message.reply(`❌ No tienes una plantilla llamada **${templateName}**.`);
//         }

//         delete templates[message.author.id][templateName];
//         saveTemplates();

//         message.reply(`🗑️ Plantilla **${templateName}** eliminada.`);
//     }

//     // ------------------------------
//     // INICIAR ACTIVIDAD
//     // ------------------------------
//     if (command === '!iniciaractividad') {
//         const templateName = args[1];
//         const userTemplates = templates[message.author.id];

//         if (!userTemplates || !userTemplates[templateName]) {
//             return message.reply(`❌ No tienes una plantilla llamada **${templateName}**.`);
//         }

//         const roles = userTemplates[templateName];

//         const embed = new EmbedBuilder()
//             .setTitle(`Actividad: ${templateName}`)
//             .setDescription(`Iniciada por <@${message.author.id}>`)
//             .setColor('Blue');

//         Object.entries(roles).forEach(([role, count]) => {
//             embed.addFields({ name: `${role} (${count} cupos)`, value: '—', inline: true });
//         });

//         const selectMenu = new StringSelectMenuBuilder()
//             .setCustomId(`join_activity_${message.id}`)
//             .setPlaceholder('Selecciona un rol para unirte')
//             .addOptions(
//                 Object.keys(roles).map(role => ({
//                     label: role,
//                     value: role,
//                 }))
//             );

//         const row = new ActionRowBuilder().addComponents(selectMenu);

//         const activityMessage = await message.channel.send({ embeds: [embed], components: [row] });

//         client.activities = client.activities || {};
//         client.activities[activityMessage.id] = {
//             creator: message.author.id,
//             templateName,
//             roles,
//             participantsByRole: {},
//         };
//     }

//     ///////////////////////////////////////////////////////////////////
// // ELIMINAR ACTIVIDAD
// ///////////////////////////////////////////////////////////////////

// if (command === '!eliminaractividad') {
//     const templateName = args[1];

//     if (!templateName) {
//         return message.reply('❗ Uso: !eliminaractividad [nombre]');
//     }

//     client.activities = client.activities || {};

//     // Buscar la actividad que coincida por nombre y creador
//     const activityId = Object.keys(client.activities).find(id => {
//         const act = client.activities[id];
//         return act.creator === message.author.id && act.templateName === templateName;
//     });

//     if (!activityId) {
//         return message.reply(`❌ No se encontró una actividad llamada **${templateName}** creada por ti.`);
//     }

//     // Eliminar del registro
//     delete client.activities[activityId];

//     // Intentar eliminar el mensaje del canal
//     try {
//         const activityMessage = await message.channel.messages.fetch(activityId);
//         await activityMessage.delete();
//     } catch (err) {
//         console.warn(`⚠️ No se pudo eliminar el mensaje de la actividad: ${err.message}`);
//     }

//     message.reply(`🗑️ Actividad **${templateName}** eliminada.`);
// }


// });

// ///////////////////////////////////////////////////////////////////
// // MANEJADOR DE INTERACCIONES (MENÚ SELECT)
// ///////////////////////////////////////////////////////////////////

// client.on('interactionCreate', async (interaction) => {
//     if (!interaction.isStringSelectMenu()) return;

//     const activity = client.activities[interaction.message.id];
//     if (!activity) {
//         return interaction.reply({ content: '❌ Esta actividad ya no está activa.', ephemeral: true });
//     }

//     const selectedRole = interaction.values[0];

//     // Inicializar estructura si no existe
//     if (!activity.participantsByRole[selectedRole]) {
//         activity.participantsByRole[selectedRole] = [];
//     }

//     // Remover al usuario de otros roles si ya estaba apuntado
//     Object.keys(activity.participantsByRole).forEach(role => {
//         activity.participantsByRole[role] = activity.participantsByRole[role].filter(id => id !== interaction.user.id);
//     });

//     // Apuntar al nuevo rol
//     activity.participantsByRole[selectedRole].push(interaction.user.id);

//     // Preparar embed actualizado
//     const updatedFields = await Promise.all(
//         Object.entries(activity.roles).map(async ([role, maxCount]) => {
//             const userIds = activity.participantsByRole[role] || [];
//             const displayedNames = await Promise.all(userIds.map(async (userId, idx) => {
//                 const user = await client.users.fetch(userId);
//                 const name = user.username;
//                 return idx < maxCount ? name : `~~${name}~~ ❌`;
//             }));
//             return {
//                 name: `${role} (${userIds.length}/${maxCount})`,
//                 value: displayedNames.length > 0 ? displayedNames.join('\n') : '—',
//                 inline: true,
//             };
//         })
//     );

//     const updatedEmbed = EmbedBuilder.from(interaction.message.embeds[0]);
//     updatedEmbed.setFields(updatedFields);

//     await interaction.update({ embeds: [updatedEmbed] });

//     // Mensaje privado al usuario
//     const userList = activity.participantsByRole[selectedRole];
//     const currentCount = userList.length;
//     const maxCount = activity.roles[selectedRole];

//     if (currentCount > maxCount) {
//         await interaction.followUp({
//             content: `✅ Te has apuntado como **${selectedRole}**. Estás en lista de espera (❌ cupo lleno).`,
//             ephemeral: true,
//         });
//     } else {
//         await interaction.followUp({
//             content: `✅ Te has apuntado como **${selectedRole}**.`,
//             ephemeral: true,
//         });
//     }
// });
// -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------





require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits, Events } = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.commands = new Collection();
client.activities = {}; // 🔹 Para almacenar actividades creadas
client.pendingDeletes = {}; // 🔹 Para rastrear peticiones de borrado

// 🔸 Cargar todos los comandos desde la carpeta /commands
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  if (command.data && command.execute) {
    client.commands.set(command.data.name, command);
  }
}

// 🔸 Cuando el bot está listo
client.once('ready', () => {
  console.log(`✅ Bot iniciado como ${client.user.tag}`);
});

// 🔸 Manejador principal de interacciones
client.on(Events.InteractionCreate, async interaction => {
  // Slash commands (/comando)
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    try {
      await command.execute(interaction, client); // 🔹 Pasamos client para usar sus datos
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: '❌ Error al ejecutar el comando.', ephemeral: true });
    }
  }

  // Autocompletado de inputs
  else if (interaction.isAutocomplete()) {
    const command = client.commands.get(interaction.commandName);
    if (command && command.autocomplete) {
      try {
        await command.autocomplete(interaction, client);
      } catch (error) {
        console.error('❌ Error en autocompletado:', error);
      }
    }
  }

  // SelectMenu para borrar actividad o unirse
  else if (interaction.isStringSelectMenu()) {
  const customId = interaction.customId;

  // 🔸 Manejar el menú de borrado
  if (customId.startsWith('select_borrar_actividad_')) {
    const messageId = interaction.values[0];
    const userId = customId.split('_').pop();
    const pending = client.pendingDeletes[userId];

    if (!pending || interaction.user.id !== pending.userId) {
      return interaction.reply({ content: '❌ No puedes usar esta selección.', ephemeral: true });
    }

    try {
      const msg = await interaction.channel.messages.fetch(messageId);
      await msg.delete();
    } catch {
      // Ignorar errores si ya fue eliminado
    }

    delete client.activities[messageId];
    delete client.pendingDeletes[userId];

    return interaction.update({
      content: '✅ Actividad eliminada correctamente.',
      components: [],
    });
  }

  // 🔸 Unirse a actividad o cancelar participación
  if (customId.startsWith('join_activity_')) {
    const activity = client.activities[interaction.message.id];
    if (!activity) return interaction.reply({ content: '❌ Actividad no encontrada.', ephemeral: true });

    const selectedValue = interaction.values[0];

    // Cancelar participación
    if (selectedValue === 'cancelar') {
      const alreadyIn = Object.entries(activity.participantsByRole).find(([, arr]) => arr.includes(interaction.user.id));

      if (!alreadyIn) {
        return interaction.reply({ content: '⚠️ No estás participando en esta actividad.', ephemeral: true });
      }

      const [previousRole, participants] = alreadyIn;
      activity.participantsByRole[previousRole] = participants.filter(id => id !== interaction.user.id);

      // Actualizar embed
      const updatedDesc = Object.entries(activity.roles).map(([role, count]) => {
        const users = activity.participantsByRole[role] || [];
        const mentions = users.map(id => `<@${id}>`).join(', ') || '—';
        return `**${role} (${count})**: ${mentions}`;
      }).join('\n');

      await interaction.message.edit({
        embeds: [{
          title: `Actividad: ${activity.templateName}`,
          description: updatedDesc,
          color: 0x3498db,
        }]
      });

      return interaction.reply({ content: '❌ Has cancelado tu participación.', ephemeral: true });
    }

    // Cambio de rol
    const alreadyIn = Object.entries(activity.participantsByRole).find(([, arr]) => arr.includes(interaction.user.id));
    if (alreadyIn) {
      const [previousRole, participants] = alreadyIn;
      activity.participantsByRole[previousRole] = participants.filter(id => id !== interaction.user.id);
    }

    activity.participantsByRole[selectedValue] ||= [];
    if (activity.participantsByRole[selectedValue].length >= activity.roles[selectedValue]) {
      return interaction.reply({ content: '❌ Ese rol ya está lleno.', ephemeral: true });
    }

    activity.participantsByRole[selectedValue].push(interaction.user.id);

    // Actualizar embed
    const updatedDesc = Object.entries(activity.roles).map(([role, count]) => {
      const users = activity.participantsByRole[role] || [];
      const mentions = users.map(id => `<@${id}>`).join(', ') || '—';
      return `**${role} (${count})**: ${mentions}`;
    }).join('\n');

    await interaction.message.edit({
      embeds: [{
        title: `Actividad: ${activity.templateName}`,
        description: updatedDesc,
        color: 0x3498db,
      }]
    });

    const message = alreadyIn
      ? `🔁 Cambiaste tu rol de **${alreadyIn[0]}** a **${selectedValue}**.`
      : `✅ Te uniste como **${selectedValue}**.`;

    return interaction.reply({ content: message, ephemeral: true });
  }
}

});

// 🔸 Iniciar sesión del bot
client.login(process.env.DISCORD_TOKEN);

