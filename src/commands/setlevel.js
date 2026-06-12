const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../systems/database');
const { totalXpForLevel } = require('../systems/xp');
const { getRoleForLevel, ROLE_MILESTONES } = require('../systems/roles');
const { logAdminAction } = require('../systems/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setlevel')
    .setDescription('[ADMIN] Définir le niveau d\'un joueur')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addUserOption(opt => opt.setName('utilisateur').setDescription('Le joueur').setRequired(true))
    .addIntegerOption(opt => opt.setName('niveau').setDescription('Niveau (1-500)').setRequired(true).setMinValue(1).setMaxValue(500)),

  async execute(interaction, client) {
    const target = interaction.options.getUser('utilisateur');
    const level = interaction.options.getInteger('niveau');
    const xp = totalXpForLevel(level);
    db.updateUser(target.id, interaction.guildId, { level, xp });

    const member = await interaction.guild.members.fetch(target.id).catch(() => null);
    if (member) {
      for (const milestone of ROLE_MILESTONES) {
        const role = interaction.guild.roles.cache.find(r => r.name === milestone.name);
        if (!role) continue;
        if (milestone.level <= level) {
          await member.roles.add(role).catch(() => {});
        } else {
          await member.roles.remove(role).catch(() => {});
        }
      }
    }

    await logAdminAction(interaction.user.id, 'Set Level', target.id, `Niveau défini à ${level} (${xp.toLocaleString()} XP)`);
    await interaction.reply({ content: `✅ <@${target.id}> est maintenant **niveau ${level}** (${xp.toLocaleString()} XP).`, ephemeral: true });
  },
};
