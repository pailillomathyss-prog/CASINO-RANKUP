const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../systems/database');
const { ROLE_MILESTONES } = require('../systems/roles');
const { logAdminAction } = require('../systems/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('resetuser')
    .setDescription('[ADMIN] Remettre à zéro un joueur')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addUserOption(opt => opt.setName('utilisateur').setDescription('Le joueur').setRequired(true)),

  async execute(interaction, client) {
    const target = interaction.options.getUser('utilisateur');
    db.updateUser(target.id, interaction.guildId, { xp: 0, level: 0, total_messages: 0, total_voice_minutes: 0, last_message_xp: 0 });

    const member = await interaction.guild.members.fetch(target.id).catch(() => null);
    if (member) {
      for (const milestone of ROLE_MILESTONES) {
        const role = interaction.guild.roles.cache.find(r => r.name === milestone.name);
        if (role) await member.roles.remove(role).catch(() => {});
      }
    }

    await logAdminAction(interaction.user.id, 'Reset Joueur', target.id, 'XP et niveau remis à zéro, rôles retirés');
    await interaction.reply({ content: `✅ <@${target.id}> a été remis à zéro.`, ephemeral: true });
  },
};
