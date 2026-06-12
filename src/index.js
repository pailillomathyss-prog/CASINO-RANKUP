require('dotenv').config();
const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const db = require('./systems/database');
const { startMissionCron } = require('./systems/missions');
const { initLogger } = require('./systems/logger');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMembers,
  ],
});

client.commands = new Collection();
client.prefixCommands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));
const commandsData = [];
for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  client.commands.set(command.data.name, command);
  commandsData.push(command.data.toJSON());
}

const prefixPath = path.join(__dirname, 'prefix');
const prefixFiles = fs.readdirSync(prefixPath).filter(f => f.endsWith('.js'));
for (const file of prefixFiles) {
  const cmd = require(path.join(prefixPath, file));
  client.prefixCommands.set(cmd.name, cmd);
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(f => f.endsWith('.js'));
for (const file of eventFiles) {
  const event = require(path.join(eventsPath, file));
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}

async function registerCommands() {
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
  const CLIENT_ID = process.env.CLIENT_ID;
  const GUILD_ID = process.env.GUILD_ID;

  try {
    if (GUILD_ID) {
      await rest.put(
        Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
        { body: commandsData }
      );
      console.log(`✅ Commandes slash enregistrées pour le serveur ${GUILD_ID} (instantané)`);
    }

    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      { body: commandsData }
    );
    console.log(`✅ Commandes slash enregistrées globalement (${commandsData.length} commandes)`);
    commandsData.forEach(c => console.log(`   /${c.name}`));
  } catch (err) {
    console.error('❌ Erreur enregistrement commandes:', err.message);
  }
}

client.once('ready', async () => {
  console.log(`✅ Bot connecté : ${client.user.tag} (ID: ${client.user.id})`);
  console.log(`🔗 Lien d'invitation : https://discord.com/oauth2/authorize?client_id=${client.user.id}&scope=bot+applications.commands&permissions=8`);
  db.init();

  await registerCommands();

  const guild = client.guilds.cache.get(process.env.GUILD_ID);
  if (guild) {
    initLogger(client, guild);
    const { setupRoles } = require('./systems/roles');
    await setupRoles(guild);
    console.log('✅ Rôles créés/vérifiés');
    const { setupInfoChannels } = require('./systems/channels');
    await setupInfoChannels(client, guild);
    console.log('✅ Salons détectés');
  } else if (process.env.GUILD_ID) {
    console.warn(`⚠️ Serveur ${process.env.GUILD_ID} introuvable — le bot n'est pas dans ce serveur`);
  }

  startMissionCron(client);
  console.log(`✅ Prefix commands : ${[...client.prefixCommands.keys()].map(k => '+' + k).join(', ')}`);
});

client.login(process.env.DISCORD_TOKEN);
