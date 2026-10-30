import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const workflowPath = path.join(root, '⚡ LinkedIn Publisher.json');
const envExamplePath = path.join(root, '.env.example');
const composePath = path.join(root, 'docker-compose.yml');

const errors = [];
const fail = (message) => errors.push(message);

let raw;
try {
  raw = fs.readFileSync(workflowPath, 'utf8');
} catch (error) {
  console.error(`❌ No se pudo leer el workflow: ${error.message}`);
  process.exit(1);
}

let wf;
try {
  wf = JSON.parse(raw);
} catch (error) {
  console.error(`❌ JSON inválido: ${error.message}`);
  process.exit(1);
}

const nodes = Array.isArray(wf.nodes) ? wf.nodes : [];
if (nodes.length === 0) fail('El workflow no tiene nodos.');

const names = nodes.map((node) => node.name);
const ids = nodes.map((node) => node.id);
const connections = wf.connections ?? {};

const duplicates = (values) => [...new Set(values.filter((value, index) => values.indexOf(value) !== index))];
const duplicateNames = duplicates(names);
const duplicateIds = duplicates(ids);
if (duplicateNames.length) fail(`Nombres de nodo duplicados: ${duplicateNames.join(', ')}`);
if (duplicateIds.length) fail(`IDs de nodo duplicados: ${duplicateIds.join(', ')}`);

for (const node of nodes) {
  if (!node.name) fail('Hay un nodo sin nombre.');
  if (!node.type) fail(`Nodo sin type: ${node.name}`);
  if (!node.typeVersion) fail(`Nodo sin typeVersion: ${node.name}`);
}

const edges = new Set();
for (const [source, groups] of Object.entries(connections)) {
  if (!names.includes(source)) fail(`Conexión desde un nodo inexistente: ${source}`);
  for (const [type, outputs] of Object.entries(groups)) {
    if (!Array.isArray(outputs)) {
      fail(`Salida inválida en ${source}.${type}`);
      continue;
    }
    for (const output of outputs) {
      if (!Array.isArray(output)) {
        fail(`Salida inválida en ${source}.${type}`);
        continue;
      }
      for (const target of output) {
        if (!target?.node) {
          fail(`Conexión sin destino en ${source}.${type}`);
          continue;
        }
        if (!names.includes(target.node)) {
          fail(`Conexión a un nodo inexistente: ${source} -> ${target.node}`);
        }
        edges.add(`${source} -> ${target.node}`);
      }
    }
  }
}

const requiredNodes = [
  'Telegram: Recibir link',
  'Extraer URL y notas',
  '¿Chat autorizado?',
  '¿Trae link?',
  'Extraer artículo (Firecrawl)',
  '¿Artículo extraído?',
  'Generar post (IA)',
  'Validar salida IA',
  'Preparar publicación',
  'Preparar mensaje aprobación',
  'Aprobar por Telegram',
  '¿Aprobado?',
  'Descargar imagen',
  'Publicar en LinkedIn',
  'Error Trigger',
  'Avisar error general',
];
for (const name of requiredNodes) {
  if (!names.includes(name)) fail(`Falta el nodo requerido: ${name}`);
}

const requiredEdges = [
  ['Extraer URL y notas', '¿Chat autorizado?'],
  ['¿Chat autorizado?', '¿Trae link?'],
  ['Extraer artículo (Firecrawl)', '¿Artículo extraído?'],
  ['¿Artículo extraído?', 'Generar post (IA)'],
  ['Generar post (IA)', 'Validar salida IA'],
  ['Validar salida IA', 'Preparar publicación'],
  ['Preparar publicación', 'Preparar mensaje aprobación'],
  ['Preparar mensaje aprobación', 'Aprobar por Telegram'],
  ['Publicar en LinkedIn', 'Confirmar publicado'],
  ['Error Trigger', 'Avisar error general'],
];
for (const [source, target] of requiredEdges) {
  if (!edges.has(`${source} -> ${target}`)) fail(`Falta la conexión: ${source} -> ${target}`);
}

const trigger = nodes.find((node) => node.name === 'Telegram: Recibir link');
if (trigger) {
  if (Number(trigger.typeVersion) < 1.5) {
    fail('El Telegram Trigger debe ser >= 1.5 para soportar chatApproval.');
  }
  const fields = trigger.parameters?.additionalFields ?? {};
  if (!fields.chatIds) fail('El trigger no filtra por chatIds.');
  if (!fields.userIds) fail('El trigger no filtra por userIds.');
}

const approval = nodes.find((node) => node.name === 'Aprobar por Telegram');
if (approval) {
  if (approval.parameters?.chatApproval !== true) {
    fail('La aprobación debe tener chatApproval: true.');
  }
  if (!approval.parameters?.approverIds) {
    fail('La aprobación debe tener approverIds.');
  }
}

for (const node of nodes) {
  if (node.credentials) {
    fail(`El nodo ${node.name} tiene credenciales; quítalas antes de publicar la plantilla.`);
  }
}

if (wf.id || wf.versionId) {
  fail('El workflow no debe incluir id/versionId para que la importación cree uno nuevo.');
}

if (wf.meta?.templateCredsSetupCompleted !== false) {
  fail('meta.templateCredsSetupCompleted debe ser false para que n8n pida configurar credenciales.');
}

const envText = fs.readFileSync(envExamplePath, 'utf8');
const declared = new Set(
  [...envText.matchAll(/^([A-Z][A-Z0-9_]*)=/gm)].map((match) => match[1]),
);
const used = new Set(
  [...raw.matchAll(/\$env\.([A-Z][A-Z0-9_]*)/g)].map((match) => match[1]),
);

for (const key of used) {
  if (!declared.has(key)) fail(`Variable usada pero no declarada en .env.example: ${key}`);
}

const requiredEnv = [
  'N8N_HOST',
  'N8N_PROTOCOL',
  'WEBHOOK_URL',
  'N8N_PROXY_HOPS',
  'N8N_ENCRYPTION_KEY',
  'N8N_BLOCK_ENV_ACCESS_IN_NODE',
  'TELEGRAM_CHAT_ID',
  'TELEGRAM_USER_ID',
  'FIRECRAWL_API_KEY',
  'FIRECRAWL_BASE_URL',
  'LINKEDIN_PERSON_ID',
  'EDITORIAL_PERSONA',
];
for (const key of requiredEnv) {
  if (!declared.has(key)) fail(`Falta ${key} en .env.example`);
}

const secretPatterns = [
  [/\bfc-[A-Za-z0-9]{20,}\b/, 'Firecrawl API key'],
  [/\bsk-[A-Za-z0-9]{20,}\b/, 'OpenAI API key'],
  [/\b\d{8,10}:[A-Za-z0-9_-]{35}\b/, 'Telegram bot token'],
];
for (const [pattern, label] of secretPatterns) {
  if (pattern.test(raw)) fail(`Posible ${label} hardcodeada en el workflow.`);
}

const compose = fs.readFileSync(composePath, 'utf8');
if (/image:\s*n8nio\/n8n(?::latest)?\s*$/m.test(compose)) {
  fail('docker-compose.yml debe fijar una versión de n8n (no usar latest).');
}

if (errors.length) {
  console.error(`❌ ${errors.length} error(es) encontrados:`);
  for (const error of errors) console.error(` - ${error}`);
  process.exit(1);
}

console.log(
  `✅ Workflow OK: ${nodes.length} nodos, ${Object.keys(connections).length} conexiones, ${edges.size} enlaces.`,
);
