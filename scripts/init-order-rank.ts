import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@sanity/client';
import { LexoRank } from 'lexorank';

// Load .env if present
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf-8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^['"]|['"]$/g, '');
    if (key && !(key in process.env)) {
      process.env[key] = val;
    }
  }
}

const isDryRun = process.argv.includes('--dry-run');

const projectId = process.env.PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.PUBLIC_SANITY_DATASET || 'production';
const writeToken = process.env.SANITY_API_WRITE_TOKEN;
const readToken = process.env.SANITY_API_READ_TOKEN;

if (!projectId) {
  console.error('[init-order-rank] Error: PUBLIC_SANITY_PROJECT_ID is not defined in environment or .env');
  process.exit(1);
}

if (!isDryRun && !writeToken) {
  console.error(
    '[init-order-rank] Error: SANITY_API_WRITE_TOKEN is required to write orderRank values.\n' +
      'Run with --dry-run to preview the order without writing, or set SANITY_API_WRITE_TOKEN in .env.'
  );
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2025-02-19',
  useCdn: false,
  token: writeToken || readToken || undefined,
});

interface ProjectDoc {
  _id: string;
  title?: string;
  slug?: string;
  order?: number | null;
  year?: number | null;
  orderRank?: string | null;
}

const LEGACY_ORDER_QUERY = `*[_type == "project" && !(_id in path("drafts.**")) && !(_id in path("versions.**"))] | order(defined(order) desc, order asc, year desc) {
  _id,
  title,
  "slug": slug.current,
  order,
  year,
  orderRank
}`;

async function main() {
  console.log(
    `[init-order-rank] Fetching projects from Sanity (${projectId}/${dataset})...` +
      (isDryRun ? ' [DRY RUN]' : '')
  );

  const projects = await client.fetch<ProjectDoc[]>(LEGACY_ORDER_QUERY);

  if (projects.length === 0) {
    console.log('[init-order-rank] No published projects found.');
    return;
  }

  let rank = LexoRank.min();
  const assignments = projects.map((doc, index) => {
    rank = rank.genNext().genNext();
    return {
      position: index + 1,
      _id: doc._id,
      title: doc.title || '(Untitled)',
      slug: doc.slug || '-',
      legacyOrder: doc.order ?? null,
      year: doc.year ?? null,
      previousOrderRank: doc.orderRank ?? null,
      newOrderRank: rank.toString(),
    };
  });

  console.log('\nResulting project order:');
  console.log('--------------------------------------------------------------------------------');
  for (const item of assignments) {
    console.log(
      `${String(item.position).padStart(2, ' ')}. ${item.title.padEnd(28, ' ')} ` +
        `(order: ${String(item.legacyOrder ?? '-').padEnd(3, ' ')}, year: ${String(item.year ?? '-')}) ` +
        `-> orderRank: ${item.newOrderRank}`
    );
  }
  console.log('--------------------------------------------------------------------------------\n');

  if (isDryRun) {
    console.log('[init-order-rank] Dry run complete. No changes were written to Sanity.');
    return;
  }

  // Also check if any drafts exist for these documents so they stay in sync
  const draftIds = assignments.map((a) => `drafts.${a._id}`);
  const existingDrafts = await client.fetch<string[]>(
    `*[_id in $draftIds]._id`,
    { draftIds }
  );
  const existingDraftSet = new Set(existingDrafts);

  const transaction = client.transaction();
  for (const item of assignments) {
    transaction.patch(item._id, {
      set: { orderRank: item.newOrderRank },
    });
    const draftId = `drafts.${item._id}`;
    if (existingDraftSet.has(draftId)) {
      transaction.patch(draftId, {
        set: { orderRank: item.newOrderRank },
      });
    }
  }

  const result = await transaction.commit({
    visibility: 'async',
    tag: 'init-order-rank',
  });

  console.log(
    `[init-order-rank] Successfully updated orderRank on ${result.results.length} document(s).`
  );
}

main().catch((err) => {
  console.error('[init-order-rank] Fatal error:', err);
  process.exit(1);
});
