# Foxel
Discord bot

## Requirements
- Node.js 20+ (for local runs)
- Docker (for container runs)

## Configuration
Create `.env` in the project root:
```bash
DISCORD_BOT_TOKEN=your_token_here
```

You can copy the example:
```bash
cp .env.example .env
```

## Local run (no Docker)
```bash
npm install
npm start
```

## Commands
Prefix: `>`

General:
- `>serverinfo` shows information about this server
- `>userinfo [@user]` shows information about given user
- `>botinfo` shows information about this bot
- `>avatar [@user]` shows given user avatar
- `>invite` sends the invitation link

Fun:
- `>coinflip` flips a coin
- `>dice` rolls a dice
- `>random [min] [max]` generates a random number

Crypto:
- `>price [crypto] [currency]` shows current price of given crypto
- `>invitecrypto [crypto]` sends invitation link for the crypto price bot

Text:
- `>wc [message]` shows word and character count
- `>reverse [message]` reverses the given message

Misc:
- `>fox` sends a picture of fox
- `>waifu` sends a picture of waifu
- `>neko` sends a picture of neko
- `>weather [city] [country]` shows weather in the given place
- `>color [hex/rgb]` sends a picture of the given color
- `>tp` shows time in percentages

## Docker
Prereqs:
- A `.env` file with `DISCORD_BOT_TOKEN` set (see `.env.example`)

### Build and run with Docker
```bash
docker build -t foxel .
docker run --env-file .env --name foxel-bot --restart unless-stopped foxel
```

### Run with docker-compose
```bash
docker compose up -d --build
```

### Logs and stop
```bash
docker logs -f foxel-bot
docker stop foxel-bot
```

### Update image
```bash
git pull
docker compose up -d --build
```

## Troubleshooting
- If the bot does not log in, confirm `DISCORD_BOT_TOKEN` is correct in `.env`.
- If commands do not respond, make sure the bot has the required Discord permissions and intents.
