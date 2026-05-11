// sync-to-drupal — Supabase Edge Function
// ⚠️ NOTE (2026-05-10): This file had uncommitted modifications that were lost in a git reset --hard.
// The current version is the last committed state. Review before working on the Drupal sync pipeline.
//
// Three modes:
//   1. Manual CREATE — called directly with { label, content_type, feature_id }
//      Creates a Drupal node and writes the NID back to features.nid.
//   2. Webhook INSERT — called by Supabase DB webhook on features INSERT.
//      Creates a Drupal node for a newly drawn feature, writes NID back.
//   3. Webhook UPDATE — called by Supabase DB webhook on features UPDATE.
//      Patches the Drupal node when label, DayStart, or DayEnd change.
//      Skips if none of those fields changed (prevents write-back loops).
//
// Secrets required (Supabase dashboard → Settings → Edge Functions):
//   DRUPAL_USERNAME, DRUPAL_PASSWORD
//   SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected automatically

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const DRUPAL_BASE  = "https://mapstructor.com/ames/encyclopedia";
const CONTENT_TYPE = "buildings";

// Convert YYYYMMDD integer to ISO date string for Drupal's Date field type
function toIso(n: number | null): string | null {
  if (!n) return null;
  const s = String(n).padStart(8, "0");
  return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
}

function drupalAuth(): string {
  return btoa(`${Deno.env.get("DRUPAL_USERNAME")}:${Deno.env.get("DRUPAL_PASSWORD")}`);
}

function json(data: unknown, status: number) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// ── Router ────────────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const body = await req.json();

  if (body.type === "UPDATE" && body.table === "features") {
    return handleUpdate(body.record, body.old_record);
  }

  if (body.type === "INSERT" && body.table === "features") {
    return handleCreate({
      label:        body.record.label,
      content_type: CONTENT_TYPE,
      feature_id:   body.record.feature_id,
    });
  }

  return handleCreate(body);
});

// ── CREATE — manual call, creates Drupal node and writes NID back ─────────────

async function handleCreate(body: { label?: string; content_type?: string; feature_id?: number }) {
  const { label, content_type, feature_id } = body;
  if (!content_type) return json({ error: "content_type is required" }, 400);

  const res = await fetch(`${DRUPAL_BASE}/jsonapi/node/${content_type}`, {
    method: "POST",
    headers: {
      "Content-Type":  "application/vnd.api+json",
      "Accept":        "application/vnd.api+json",
      "Authorization": `Basic ${drupalAuth()}`,
    },
    body: JSON.stringify({
      data: {
        type: `node--${content_type}`,
        attributes: { title: label || "Untitled", status: true },
      },
    }),
  });

  if (!res.ok) return json({ error: "Drupal node creation failed", detail: await res.text() }, 500);

  const nid = (await res.json()).data.attributes.drupal_internal__nid;

  if (feature_id) {
    const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { error } = await db.from("features").update({ nid }).eq("feature_id", feature_id);
    if (error) return json({ nid, warning: "NID created but write-back failed", detail: error.message }, 207);
  }

  return json({ nid }, 200);
}

// ── UPDATE — DB webhook, patches Drupal node when core fields change ──────────

async function handleUpdate(record: Record<string, unknown>, old: Record<string, unknown>) {
  const nid = record.nid as number | null;
  if (!nid) return json({ skipped: "no nid" }, 200);

  const labelChanged = record.label    !== old.label;
  const startChanged = record.DayStart !== old.DayStart;
  const endChanged   = record.DayEnd   !== old.DayEnd;

  if (!labelChanged && !startChanged && !endChanged) {
    return json({ skipped: "no relevant changes" }, 200);
  }

  // JSON:API PATCH requires the node UUID, not the NID — look it up
  const auth = drupalAuth();
  const lookupRes = await fetch(
    `${DRUPAL_BASE}/jsonapi/node/${CONTENT_TYPE}?filter[drupal_internal__nid]=${nid}`,
    { headers: { "Accept": "application/vnd.api+json", "Authorization": `Basic ${auth}` } }
  );
  if (!lookupRes.ok) return json({ error: "UUID lookup failed", detail: await lookupRes.text() }, 500);

  const lookupData = await lookupRes.json();
  if (!lookupData.data?.length) return json({ error: "Node not found", nid }, 404);

  const uuid = lookupData.data[0].id;
  const attributes: Record<string, unknown> = {};
  if (labelChanged) attributes.title                        = record.label || "Untitled";
  if (startChanged) attributes.field_start_date_date_type   = toIso(record.DayStart as number);
  if (endChanged)   attributes.field_end_date_date_type     = toIso(record.DayEnd as number);

  const patchRes = await fetch(`${DRUPAL_BASE}/jsonapi/node/${CONTENT_TYPE}/${uuid}`, {
    method: "PATCH",
    headers: {
      "Content-Type":  "application/vnd.api+json",
      "Accept":        "application/vnd.api+json",
      "Authorization": `Basic ${auth}`,
    },
    body: JSON.stringify({
      data: { type: `node--${CONTENT_TYPE}`, id: uuid, attributes },
    }),
  });

  if (!patchRes.ok) return json({ error: "Drupal PATCH failed", detail: await patchRes.text() }, 500);

  return json({ updated: nid }, 200);
}
