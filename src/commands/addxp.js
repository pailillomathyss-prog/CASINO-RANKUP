const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { addXp } = require('../systems/xp');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('addxp')
    .setDescription('[ADMIN] Ajouter de l\'XP à un joueur')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addUserOption(opt => opt.setName('utilisateur').setDescription('Le joueur').setRequired(true))
    .addIntegerOption(opt => opt.setName('quantite').setDescription('XP à ajouter').setRequired(true).setMinValue(1)),

  async execute(interaction, client) {
    const target = interaction.options.getUser('utilisateur');
    const amount = interaction.options.getInteger('quantite');
    const { newLevel, leveledUp } = await addXp(target.id, interaction.guildId, amount, client);
    let msg = `✅ **+${amount} XP** ajouté à <@${target.id}>. Niveau actuel : **${newLevel}**`;
    if (leveledUp) msg += ' 🎉 Level up !';
    await interaction.reply({ content: msg, ephemeral: true });
  },
};
