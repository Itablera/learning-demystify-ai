# Document Routes

At this point we have a complete definition of the Document domain and use-cases. Copilot have also assisted us to create implemented services for ingestion and search. Now we need to implement the API routes for these use-cases. The routes will be implemented in the `apps/api/src/routes` directory.

## Prompt

Implement API routes for the Document use-cases, #file:ingestDocument.ts and #file:searchDocuments.ts . Use #file:ai-service.ts and #file:embeddings.ts . Use a in memory mock of #sym:DocumentRepository
