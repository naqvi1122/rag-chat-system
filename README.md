# Simple NestJS RAG App

This is a small RAG backend using NestJS, LangChain, OpenAI embeddings/chat, MongoDB for app data, and Qdrant for vector search.

## Flow

1. User registers or logs in and receives a JWT.
2. User uploads a PDF, DOCX, or TXT file.
3. The server extracts text, chunks it, creates embeddings, and saves vectors in Qdrant with the user id in payload metadata.
4. User asks a question.
5. The server retrieves only that user's relevant chunks from Qdrant, adds recent chat memory from MongoDB, and asks the LLM for an answer.
6. Users, uploaded document records, and assistant/user messages are saved in MongoDB, so memory is available after the user logs in again.

## Setup

```bash
cp .env.example .env
docker compose up -d
pnpm install
pnpm run start:dev
```

Set `OPENAI_API_KEY` in `.env` before uploading or asking questions.

## Swagger

After starting the server, open:

```text
http://localhost:3000/api/docs
```

Use `auth/register` or `auth/login`, copy the returned `accessToken`, click **Authorize**, and paste it as the bearer token. Then you can upload files and ask questions directly from Swagger.

## API

Register:

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

Login:

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

Upload a document:

```bash
curl -X POST http://localhost:3000/documents/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/file.pdf"
```

Ask a question:

```bash
curl -X POST http://localhost:3000/chat/ask \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"question":"What does this document say about refunds?"}'
```

Get chat memory:

```bash
curl http://localhost:3000/chat/history \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Notes

- MongoDB stores users, uploaded document metadata, and chat memory.
- Qdrant is the vector database. It stores embeddings plus payload metadata like `userId`, `documentId`, source name, chunk index, and chunk content.
- DOCX is supported. Legacy `.doc` files are not supported by this simple parser.
- `text-embedding-3-small` creates 1536-dimensional vectors, matching the Qdrant collection created by `VectorService`.
- For larger production systems, add background jobs for ingestion, object storage for files, and document deletion endpoints that also remove Qdrant points.
