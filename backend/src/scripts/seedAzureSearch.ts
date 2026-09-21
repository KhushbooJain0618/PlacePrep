import fs from 'fs';
import path from 'path';
import { config } from '../config/env.js';

interface SearchDoc {
  '@search.action': 'mergeOrUpload';
  id: string;
  title: string;
  source: string;
  category: string;
  content: string;
}

async function seedAzureSearch() {
  const { endpoint, apiKey, indexName } = config.azure.search;

  if (!endpoint || !apiKey) {
    console.error('❌ Error: AZURE_SEARCH_ENDPOINT and AZURE_SEARCH_API_KEY must be set in backend/.env to run seeding.');
    process.exit(1);
  }

  console.log(`🚀 Connecting to Azure AI Search service at: ${endpoint}`);
  console.log(`🎯 Target Index: ${indexName}`);

  const apiVersion = '2023-11-01';

  // 1. Create or Update Search Index Schema
  const indexUrl = `${endpoint}/indexes/${indexName}?api-version=${apiVersion}`;
  const indexDefinition = {
    name: indexName,
    fields: [
      { name: 'id', type: 'Edm.String', key: true, filterable: true },
      { name: 'title', type: 'Edm.String', searchable: true, filterable: true, sortable: true },
      { name: 'source', type: 'Edm.String', searchable: true, filterable: true },
      { name: 'category', type: 'Edm.String', searchable: true, filterable: true, facetable: true },
      { name: 'content', type: 'Edm.String', searchable: true }
    ],
    corsOptions: {
      allowedOrigins: ['*']
    }
  };

  console.log('📦 Provisioning search index schema...');
  const createIndexRes = await fetch(indexUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'api-key': apiKey
    },
    body: JSON.stringify(indexDefinition)
  });

  if (!createIndexRes.ok) {
    const errText = await createIndexRes.text();
    console.error(`❌ Failed to provision index: HTTP ${createIndexRes.status} - ${errText}`);
    process.exit(1);
  }
  console.log('✅ Search index schema provisioned successfully.');

  // 2. Discover local knowledge base files
  const possibleKbPaths = [
    path.resolve(process.cwd(), '../knowledge-base'),
    path.resolve(process.cwd(), 'knowledge-base')
  ];
  let kbPath = possibleKbPaths.find(p => fs.existsSync(p));

  if (!kbPath) {
    console.error('❌ Knowledge base directory not found.');
    process.exit(1);
  }

  const files = fs.readdirSync(kbPath).filter(f => f.endsWith('.md') && f !== 'README.md');
  console.log(`📚 Found ${files.length} knowledge base files to index:`, files);

  const docs: SearchDoc[] = [];

  for (const file of files) {
    const fullPath = path.join(kbPath, file);
    const content = fs.readFileSync(fullPath, 'utf-8');

    // Split markdown into logical sections (by headers)
    const sections = content.split(/(?=^##\s+)/gm);

    sections.forEach((section, idx) => {
      const trimmed = section.trim();
      if (trimmed.length < 50) return;

      const headerMatch = trimmed.match(/^##\s+(.*)/m);
      const sectionTitle = headerMatch ? headerMatch[1].trim() : file.replace('.md', '');
      const safeId = `${file.replace('.md', '')}-${idx}`.replace(/[^a-zA-Z0-9-_]/g, '-');

      docs.push({
        '@search.action': 'mergeOrUpload',
        id: safeId,
        title: `${sectionTitle} (${file})`,
        source: file,
        category: file.replace('-guide.md', '').replace('-curriculum.md', '').toUpperCase(),
        content: trimmed.substring(0, 4000)
      });
    });
  }

  console.log(`📤 Uploading ${docs.length} document chunks to Azure AI Search...`);

  const uploadUrl = `${endpoint}/indexes/${indexName}/docs/index?api-version=${apiVersion}`;
  const uploadRes = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': apiKey
    },
    body: JSON.stringify({ value: docs })
  });

  if (!uploadRes.ok) {
    const errText = await uploadRes.text();
    console.error(`❌ Failed to upload documents: HTTP ${uploadRes.status} - ${errText}`);
    process.exit(1);
  }

  console.log(`🎉 SUCCESS! Uploaded ${docs.length} knowledge chunks to Azure AI Search index '${indexName}'.`);
}

seedAzureSearch().catch(err => {
  console.error('Unhandled seeding error:', err);
  process.exit(1);
});
