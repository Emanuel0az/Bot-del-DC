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

