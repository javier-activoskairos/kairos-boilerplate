// Sincroniza el estado del repositorio con el panel de control en Notion.
// Upsert por nombre de repo en la base de datos [AKW] - Webs.
// Sin dependencias externas: usa fetch nativo (Node >= 18) y la REST API de Notion.
//
// Configurar como GitHub Action secrets:
//   NOTION_TOKEN    → token de la integración interna de Notion
//   NOTION_WEBS_DB  → ID de la data source (DB) donde se registran las webs
//
// Mientras los secrets sean placeholders, el script avisa y termina sin error
// para no romper el pipeline del boilerplate.

const NOTION_API = "https://api.notion.com/v1";
const NOTION_VERSION = "2022-06-28";

const {
  NOTION_TOKEN,
  NOTION_WEBS_DB,
  REPO_NAME,
  REPO_URL,
  COMMIT_SHA,
  COMMIT_MSG,
  BRANCH,
} = process.env;

if (!NOTION_TOKEN || !NOTION_WEBS_DB) {
  console.log(
    "[notion-sync] NOTION_TOKEN o NOTION_WEBS_DB sin definir. Sync omitido (placeholders).",
  );
  process.exit(0);
}

const headers = {
  Authorization: `Bearer ${NOTION_TOKEN}`,
  "Notion-Version": NOTION_VERSION,
  "Content-Type": "application/json",
};

async function notion(path, init) {
  const res = await fetch(`${NOTION_API}${path}`, { ...init, headers });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Notion ${path} → ${res.status}: ${body}`);
  }
  return res.json();
}

async function findPageByRepo(repoName) {
  const data = await notion(`/databases/${NOTION_WEBS_DB}/query`, {
    method: "POST",
    body: JSON.stringify({
      filter: { property: "Repo", rich_text: { equals: repoName } },
      page_size: 1,
    }),
  });
  return data.results[0] ?? null;
}

function buildProperties() {
  const shortSha = (COMMIT_SHA ?? "").slice(0, 7);
  return {
    Repo: { rich_text: [{ text: { content: REPO_NAME ?? "" } }] },
    "URL Repo": { url: REPO_URL || null },
    Rama: { rich_text: [{ text: { content: BRANCH ?? "" } }] },
    "Último commit": {
      rich_text: [
        {
          text: {
            content: `${shortSha} ${COMMIT_MSG ?? ""}`.trim().slice(0, 200),
          },
        },
      ],
    },
    Sincronizado: { date: { start: new Date().toISOString() } },
  };
}

async function main() {
  const properties = buildProperties();
  const existing = await findPageByRepo(REPO_NAME);

  if (existing) {
    await notion(`/pages/${existing.id}`, {
      method: "PATCH",
      body: JSON.stringify({ properties }),
    });
    console.log(`[notion-sync] Página actualizada: ${existing.id}`);
  } else {
    const created = await notion(`/pages`, {
      method: "POST",
      body: JSON.stringify({
        parent: { database_id: NOTION_WEBS_DB },
        properties: {
          ...properties,
          Nombre: { title: [{ text: { content: REPO_NAME ?? "Web" } }] },
        },
      }),
    });
    console.log(`[notion-sync] Página creada: ${created.id}`);
  }
}

main().catch((err) => {
  console.error(`[notion-sync] Error: ${err.message}`);
  process.exit(1);
});
