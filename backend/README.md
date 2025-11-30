
# Backend - Mini Verifiable Credential API

 NestJS API for W3C Verifiable Credential operations.


## Tech Stack

- NestJS 11
- TypeScript 5.7
- jose (EdDSA signing)
- Ed25519 cryptography


## Cryptography

- Algorithm: EdDSA (Ed25519)
- Key Storage: AES-256-GCM encrypted
- JWT Library: jose v6.1.2


## Prerequisites

- Node.js
- npm


## Run Locally

Go to the backend

```bash
  cd backend
```

Install dependencies

```bash
  npm install
```

Environment Variables

```bash
  cp .env.example .env
```

To run this project, you will need to configure below environment variables.

```bash
  PORT=3000
  KEY_ENCRYPTION_PASSPHRASE=your-strong-passphrase-here
  ALLOWED_ORIGINS=all-allowed-origine (e.g. http://localhost:5173)
```

Start the server

```bash
  npm run start:dev
```

Backend runs at: [http://localhost:3000](http://localhost:3000)


## Quick Run (using docker)

```bash
  docker-compose up
```


## Docker Deployment

**Build**

```bash
  docker build -t vc-wallet-backend .
```

**Run**

```bash
  docker run -d \
    --name vc-wallet-backend \
    -p 3000:3000 \
    -e KEY_ENCRYPTION_PASSPHRASE=your-passphrase \
    -e ALLOWED_ORIGINS=http://localhost:5173 \
    -v $(pwd)/data:/app/data \
    -v $(pwd)/keys:/app/keys \
```


## API Endpoints and Documentation

**Key Endpoints**

A quick reference for the main features:


| Method | Endpoint | Required Parameters | Success Response | Error Responses |
| --- | --- | --- | --- | --- |
| `GET` | `/` | None | `200 OK` | - |
| `POST` | `/credentials/issue` | Body: `type`, `credentialSubject`,`userId` | `201 Created` | `400 Bad Request` |
| `GET` | `/credentials` | Query: `userId` | `200 OK` | `400 Bad Request` |
| `GET` | `/credentials/:id` |Path: `id` | `200 OK` | `404 Not Found` |
| `POST` | `/credentials/verify` |Body: `token` | `200 OK` | `400 Bad Request` |
| `DELETE` | `/credentials/:id` |Path: `id` | `204 No Content` | `404 Not Found` |

**Documentation (Swagger)**

Full, interactive documentation is available automatically once the server is running.

```bash
  http://{server-ip}:{PORT}/api-docs
```