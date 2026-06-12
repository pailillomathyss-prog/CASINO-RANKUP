const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { setupInfoChannels, channelIds } = require('../systems/channels');
const { setupRoles } = require('../systems/roles');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup-all')
    .setDescription('[ADMIN] Reconfigurer tous les salons et rôles du bot en une seule commande')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });

    await setupRoles(interaction.guild);
    await setupInfoChannels(client, interaction.guild);

    const lines = [
      '✅ **Tous les salons et rôles ont été configurés !**\n',
      '**Salons mis à jour :**',
    ];

    const names = {
      niveaux:     '📈・niveau-xp',
      recompenses: '🎖️・récompenses',
      classement:  '🏅・classement',
      missions:    '📜・missions',
    };

    for (const [key, label] of Object.entries(names)) {
      const id = channelIds[key];
      lines.push(id ? `• ${label} → <#${id}>` : `• ${label} → ❌ introuvable`);
    }

    lines.push('\n**15 rôles** créés/vérifiés (Niveau 5 → LÉGENDE 500)');

    await interaction.editReply(lines.join('\n'));
  },
};
