const { SlashCommandBuilder, StringSelectMenuBuilder, ActionRowBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('borrar_actividad')
        .setDescription('Borra una de tus actividades activas'),

    async execute(interaction) {
        const userId = interaction.user.id;
        const client = interaction.client;
        const activities = client.activities || {};

        // Filtrar solo actividades creadas por este usuario
        const userActivities = Object.entries(activities).filter(
            ([msgId, data]) => data.creator === userId
        );

        if (userActivities.length === 0) {
            return interaction.reply({ content: '❌ No tienes actividades activas para borrar.', ephemeral: true });
        }

        // Si hay solo una, la borramos directamente
        if (userActivities.length === 1) {
            const [messageId, activity] = userActivities[0];
            const channel = interaction.channel;
            try {
                const msg = await channel.messages.fetch(messageId);
                await msg.delete();
            } catch {
                // Mensaje ya no existe
            }
            delete client.activities[messageId];
            return interaction.reply({ content: `✅ Actividad **${activity.templateName}** eliminada.`, ephemeral: true });
        }

        // Si hay varias, mostrar menú para elegir cuál borrar
        const options = userActivities.map(([msgId, data]) => ({
            label: `${data.templateName}`,
            description: `ID: ${msgId.slice(0, 6)}...`,
            value: msgId,
        }));

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId(`select_borrar_actividad_${interaction.id}`)
            .setPlaceholder('Selecciona una actividad para borrar')
            .addOptions(options);

        const row = new ActionRowBuilder().addComponents(selectMenu);

        await interaction.reply({
            content: '🗑️ Selecciona la actividad que deseas borrar:',
            components: [row],
            ephemeral: true,
        });

        // Guardar en cache el estado temporal de selección
        client.pendingDeletes = client.pendingDeletes || {};
        client.pendingDeletes[interaction.id] = {
            userId,
            activities: userActivities.map(([msgId]) => msgId),
        };
    }
};
