# Quantus Report Card

A webapp that generates a security report by analyzing Ethereum addresses for quantum risk. Supports both Ethereum addresses (0x...) and ENS names (.eth).

## Get Started

Make sure you have [bun installed](https://bun.com/docs/installation).

1. Install Deps

```sh
bun install
```

2. Add `.env` to set API keys. Copy the .env.example and add:
   - `ETHERSCAN_API_KEY` - Your Etherscan API key for blockchain data
   - `INFURA_API_KEY` - Your Infura project ID for ENS resolution

3. Start development

```sh
bun dev
```

4. Deploy

```sh
bun run deploy
```
