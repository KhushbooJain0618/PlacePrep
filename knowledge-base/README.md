# PlacePrep Curated Placement Knowledge Base

This folder contains high-quality, verified interview preparation guides and curriculum notes used to ground the **PlacePrep AI Placement Chatbot** via Retrieval-Augmented Generation (RAG).

## RAG & Azure AI Search Architecture
1. **Document Ingestion**: These markdown files are ingested and chunked (e.g. 500-1000 tokens with 10% overlap).
2. **Embedding Generation**: Azure OpenAI `text-embedding-3-small` or `text-embedding-ada-002` converts chunks into high-dimensional vectors.
3. **Index Storage**: Chunks and vector representations are indexed in **Azure AI Search** (`placement-knowledge-index`).
4. **Hybrid Search Retrieval**: When a student queries the chatbot, hybrid search (keyword BM25 + vector cosine similarity) retrieves the top relevant chunks.
5. **Grounded Synthesis**: The AI model formulates a verified response, citing specific source guides in its output.

In **Development Mock Mode** (`USE_MOCK_AI=true`), `searchService.ts` performs semantic matching against these local documents directly, guaranteeing grounded responses without requiring active cloud credentials.
