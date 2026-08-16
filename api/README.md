# Publisher API

Mock API server for a social-media publishing panel. Node.js + TypeScript + Express, in-memory storage.

## Requirements

- Node.js 20 or newer
- pnpm

## Install

```bash
pnpm install
```

## Run

```bash
pnpm api
```

The server starts on `http://localhost:4000` and reloads on file changes.

```bash
curl http://localhost:4000/api/channels
```

Data is kept in memory and is rebuilt from a fixed seed on every start. `POST /api/_reset` restores the initial data without restarting.

See [API.md](./API.md) for the full endpoint reference.
