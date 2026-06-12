const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { setupInfoChannels, postClassement, postNiveauxInfo, postRecompenses, postMissions, channelIds } = require('../systems/channels');
const { setupRoles } = require('../systems/roles');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup-all')
    .setDescription('[ADMIN] Reconfigurer tous les salons et rôles du bot')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });
    await setupRoles(interaction.guild);
    await setupInfoChannels(client, interaction.guild);

    const names = {
      niveaux:     '📈・niveau-xp',
      recompenses: '🎖️・récompenses',
      classement:  '🏅・classement',
      missions:    '📜・missions',
    };
    const lines = ['✅ **Tous les salons et rôles ont été configurés !**\n', '**Salons détectés :**'];
    for (const [key, label] of Object.entries(names)) {
      const id = channelIds[key];
      lines.push(id ? `• ${label} → <#${id}>` : `• ${label} → ❌ introuvable`);
    }
    lines.push('\n**15 rôles** créés/vérifiés (Niveau 5 → LÉGENDE 500)');
    lines.push('\nUtilisez `/setup-niveaux`, `/setup-roles`, `/setup-classement`, `/setup-missions` pour poster le contenu dans chaque salon.');
    await interaction.editReply(lines.join('\n'));
  },
};
