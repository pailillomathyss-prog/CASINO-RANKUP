require('dotenv').config();
const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const db = require('./systems/database');
const { startMissionCron } = require('./systems/missions');
const { initLogger } = require('./systems/logger');

const CLIENT_ID = '1514788596400259092';

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
  try {
    await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commandsData });
    console.log(`✅ ${commandsData.length} commandes slash enregistrées globalement :`);
    commandsData.forEach(c => console.log(`   /${c.name}`));
  } catch (err) {
    console.error('❌ Erreur enregistrement commandes globales:', err.message);
  }

  const GUILD_ID = process.env.GUILD_ID;
  if (GUILD_ID) {
    try {
      await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commandsData });
      console.log(`✅ Commandes aussi enregistrées pour le serveur ${GUILD_ID} (instantané)`);
    } catch (err) {
      console.error('⚠️ Enregistrement serveur échoué (non bloquant):', err.message);
    }
  }
}

client.once('ready', async () => {
  console.log(`✅ Bot connecté : ${client.user.tag}`);
  db.init();
  await registerCommands();

  const GUILD_ID = process.env.GUILD_ID;
  if (GUILD_ID) {
    const guild = client.guilds.cache.get(GUILD_ID);
    if (guild) {
      initLogger(client, guild);
      const { setupRoles } = require('./systems/roles');
      await setupRoles(guild);
      console.log('✅ Rôles créés/vérifiés');
      const { setupInfoChannels } = require('./systems/channels');
      await setupInfoChannels(client, guild);
      console.log('✅ Salons détectés');
    } else {
      console.warn(`⚠️ Serveur ${GUILD_ID} introuvable — vérifiez GUILD_ID`);
    }
  }

  startMissionCron(client);
  console.log(`✅ Prefix : ${[...client.prefixCommands.keys()].map(k => '+' + k).join(', ')}`);
});

client.login(process.env.DISCORD_TOKEN);
