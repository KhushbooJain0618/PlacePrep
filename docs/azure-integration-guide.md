# Microsoft Azure AI Integration Guide for PlacePrep

This guide explains how to connect PlacePrep to active Microsoft Azure AI cloud services when transitioning from **Development Mock Mode** to live production.

---

## 1. Prerequisites

- Microsoft Azure Subscription (Azure for Students or standard subscription).
- Azure Resource Group (e.g. `rg-placeprep-dev`).
- Azure CLI or Azure Portal access.

---

## 2. Setting Up Azure Services

### Step 1: Microsoft Foundry & Azure OpenAI
1. In Azure Portal or [Microsoft AI Foundry](https://ai.azure.com/), create an Azure OpenAI resource or Foundry project.
2. Deploy a model (e.g., `gpt-4o` or `gpt-4o-mini`).
3. Note your endpoint, deployment name, and API key.

### Step 2: Azure AI Search (Knowledge Grounding / RAG)
1. Create an Azure AI Search service.
2. In the Search portal, create an index called `placement-knowledge-index`.
3. Ingest documents from `/knowledge-base` using the built-in Azure blob or file indexer.
4. Note your search endpoint and admin query key.

### Step 3: Azure AI Speech
1. Create a Cognitive Services / Azure Speech service.
2. Note your Speech Key and Region (e.g. `eastus`).

### Step 4: Azure AI Vision
1. Create a Computer Vision service in the same resource group.
2. Note your Vision endpoint and key.

---

## 3. Configuring PlacePrep Environment Variables

All API keys are configured directly in `backend/.env`.

```env
# Set to false to activate live Azure calls instead of mock mode
USE_MOCK_AI=false

# 1. Microsoft Foundry / Azure OpenAI
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
AZURE_OPENAI_API_KEY=your_azure_openai_key
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4o
AZURE_OPENAI_API_VERSION=2024-02-01

# 2. Azure AI Search
AZURE_SEARCH_ENDPOINT=https://your-search.search.windows.net
AZURE_SEARCH_API_KEY=your_search_api_key
AZURE_SEARCH_INDEX_NAME=placement-knowledge-index

# 3. Azure AI Speech
AZURE_SPEECH_KEY=your_speech_key
AZURE_SPEECH_REGION=eastus
AZURE_SPEECH_VOICE=en-US-JennyNeural

# 4. Azure AI Vision
AZURE_VISION_ENDPOINT=https://your-vision.cognitiveservices.azure.com
AZURE_VISION_KEY=your_vision_key
```

---

## 4. Automated Azure AI Search Seeding

Instead of manually building search indexes and uploading JSON in the Azure portal, PlacePrep includes a turnkey seeder script:

```bash
cd backend
npm run seed:azure-search
```

This command automatically:
1. Provisions `placement-knowledge-index` on your Azure AI Search instance with the optimal schema.
2. Ingests and chunks all curated placement preparation documents from `/knowledge-base`.

---

## 5. Live Verification & Diagnostics

Once your keys are saved in `backend/.env`:
- **Dashboard UI**: Visit the Student Hub (`/dashboard`) to view live Azure status pills for OpenAI, Search, Speech, and Vision. Click **Check Status** to test connection.
- **Diagnostics API**: Query `GET http://localhost:5000/api/azure/diagnostics` to receive real-time connectivity status and diagnostics for each service.
