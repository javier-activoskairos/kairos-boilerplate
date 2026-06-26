// Sincroniza el estado del repositorio con el panel de control en Notion.
// En cada push a main:
//   1. Upsert de la fila en [AKE] - Webs/Repos (clave: Repo URL).
//   2. Alta de una fila en [AKE] - Despliegues ligada a esa web.
//
// Sin dependencias externas: usa fetch nativo (Node >= 18) y la REST API de Notion.
//
// GitHub Action secrets:
//   NOTION_TOKEN       → token de la integración interna de Notion
//   NOTION_WEBS_DB     → ID de la base [AKE] - Webs/Repos
//   NOTION_DEPLOYS_DB  → ID de la base [AKE] - Despliegues
//
// Si faltan los secrets, el script avisa y termina sin error.

const NOTION_API = "https://api.notion.com/v1";
const NOTION_VERSION = "2022-06-28";

const {
  NOTION_TOKEN,
  NOTION_WEBS_DB,
  NOTION_DEPLOYS_DB,
  REPO_NAME,
  REPO_URL,
  COMMIT_SHA,
  COMMIT_MSG,
  BRANCH,
  DEPLOY_URL,
} = process.env;

if (!NOTION_TOKEN || !NOTION_WEBS_DB || !NOTION_DEPLOYS_DB) {
  console.log(
    "[notion-sync] Faltan NOTION_TOKEN / NOTION_WEBS_DB / NOTION_DEPLOYS_DB. Sync omitido.",
  );
  process.exit(0);
}

// Stack por defecto del boilerplate; ajustar por repo si cambia.
const STACK = ["Next.js", "TypeScript", "Tailwind", "shadcn/ui"];

const headers = {
  Authorization: `Bearer ${NOTION_TOKEN}`,
  "Notion-Version": NOTION_VERSION,
  "Content-Type": "application/json",
};

async function notion(path, init) {
  const res = await fetch(`${NOTION_API}${path}`, { ...init, headers });
  if (!res.ok) {
    throw new Error(`Notion ${path} → ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

async function findWebByRepo(repoUrl) {
  const data = await notion(`/databases/${NOTION_WEBS_DB}/query`, {
    method: "POST",
    body: JSON.stringify({
      filter: { property: "Repo URL", url: { equals: repoUrl } },
      page_size: 1,
    }),
  });
  return data.results[0] ?? null;
}

async function upsertWeb() {
  const properties = {
    Nombre: { title: [{ text: { content: REPO_NAME ?? "Web" } }] },
    "Repo URL": { url: REPO_URL || null },
    Stack: { multi_select: STACK.map((name) => ({ name })) },
    Entorno: { select: { name: "Render" } },
    Estado: { status: { name: "En producción" } },
  };

  const existing = await findWebByRepo(REPO_URL);
  if (existing) {
    await notion(`/pages/${existing.id}`, {
      method: "PATCH",
      body: JSON.stringify({ properties }),
    });
    console.log(`[notion-sync] Web actualizada: ${existing.id}`);
    return existing.id;
  }

  const created = await notion(`/pages`, {
    method: "POST",
    body: JSON.stringify({
      parent: { database_id: NOTION_WEBS_DB },
      properties,
    }),
  });
  console.log(`[notion-sync] Web creada: ${created.id}`);
  return created.id;
}

async function createDeploy(webId) {
  const shortSha = (COMMIT_SHA ?? "").slice(0, 7);
  const title = `${shortSha} ${COMMIT_MSG ?? ""}`.trim().slice(0, 200) || shortSha;

  const properties = {
    Nombre: { title: [{ text: { content: title } }] },
    "Rama / commit": {
      rich_text: [{ text: { content: `${BRANCH ?? ""} @ ${shortSha}`.trim() } }],
    },
    Resultado: { select: { name: "OK" } },
    Web: { relation: [{ id: webId }] },
  };
  if (DEPLOY_URL) properties["URL preview"] = { url: DEPLOY_URL };

  const created = await notion(`/pages`, {
    method: "POST",
    body: JSON.stringify({
      parent: { database_id: NOTION_DEPLOYS_DB },
      properties,
    }),
  });
  console.log(`[notion-sync] Despliegue creado: ${created.id}`);
}

async function main() {
  const webId = await upsertWeb();
  await createDeploy(webId);
}

main().catch((err) => {
  console.error(`[notion-sync] Error: ${err.message}`);
  process.exit(1);
});
