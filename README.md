# 🎮 CASINO-RANKUP — Bot Discord

Bot Discord avec système de niveaux, missions quotidiennes et classement en temps réel.

## Fonctionnalités

- **Système de niveaux** (max niveau 500) avec gain d'XP par messages et vocal
- **Rôles automatiques** créés et attribués par le bot selon les paliers de niveaux
- **Classement en temps réel** mis à jour toutes les 5 minutes
- **Missions quotidiennes** renouvelées toutes les 24h
- **Salons automatiques** créés par le bot

## Variables d'environnement requises

| Variable | Description |
|---|---|
| `DISCORD_TOKEN` | Token de votre bot Discord |
| `CLIENT_ID` | ID de l'application Discord |
| `GUILD_ID` | ID de votre serveur Discord |

## Déploiement sur Railway

1. Connectez ce repo GitHub à Railway
2. Ajoutez les 3 variables d'environnement dans Railway
3. Railway démarre automatiquement le bot

## Commandes

| Commande | Description |
|---|---|
| `/rank [@joueur]` | Voir son niveau et XP |
| `/classement` | Top 10 du serveur |
| `/missions` | Missions du jour |
| `/help` | Liste des commandes |
| `/addxp @joueur <xp>` | (Admin) Ajouter de l'XP |
| `/setlevel @joueur <niveau>` | (Admin) Définir un niveau |
| `/resetuser @joueur` | (Admin) Remettre à zéro |

## Salons créés automatiquement

- `📈・niveau-xp` — Explication du système XP
- `🎖️・récompenses` — Rôles à gagner par niveau
- `🏅・classement` — Classement mis à jour en temps réel
- `📜・missions` — Missions quotidiennes

## Rôles créés automatiquement

| Niveau | Rôle |
|---|---|
| 5 | ⭐ Niveau 5 |
| 10 | ⭐ Niveau 10 |
| 20 | 🌟 Niveau 20 |
| 30 | 🌟 Niveau 30 |
| 50 | 💎 Niveau 50 |
| 75 | 💎 Niveau 75 |
| 100 | 🔥 Niveau 100 |
| 150 | 🔥 Niveau 150 |
| 200 | 👑 Niveau 200 |
| 250 | 👑 Niveau 250 |
| 300 | 🌌 Niveau 300 |
| 350 | 🌌 Niveau 350 |
| 400 | 🏆 Niveau 400 |
| 450 | 🏆 Niveau 450 |
| 500 | 🎯 LÉGENDE 500 |
