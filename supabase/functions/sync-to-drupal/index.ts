// sync-to-drupal — Supabase Edge Function
//
// Creates a Drupal node via JSON:API and writes the NID back to the
// Supabase features table. Called from scripts/publish_to_mapbox.py
// after features are written to PostGIS.
//
// MAPBOX CHARGE RISK: this function does not touch Mapbox directly, but
// it is part of the pipeline that leads to a Mapbox tileset republish.
//
// Secrets required (set via Supabase dashboard → Settings → Edge Functions):
//   DRUPAL_USERNAME  — Drupal admin username
//   DRUPAL_PASSWORD  — Drupal admin password
//   (SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected automatically)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const DRUPAL_BASE = "https://mapstructor.com/ames/encyclopedia";

Deno.serve(async (req) => {
  // Only accept POST
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const { label, content_type, feature_id } = await req.json();

  if (!content_type) {
    return new Response(JSON.stringify({ error: "content_type is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // --- Step 1: create Drupal node via JSON:API ---

  const username = Deno.env.get("DRUPAL_USERNAME");
  const password = Deno.env.get("DRUPAL_PASSWORD");
  const auth     = btoa(`${username}:${password}`);

  // JSON:API node creation requires Content-Type and Accept both set to
  // application/vnd.api+json — Drupal rejects the request otherwise.
  const drupalRes = await fetch(
    `${DRUPAL_BASE}/jsonapi/node/${content_type}`,
    {
      method: "POST",
      headers: {
        "Content-Type":  "application/vnd.api+json",
        "Accept":        "application/vnd.api+json",
        "Authorization": `Basic ${auth}`,
      },
      body: JSON.stringify({
        data: {
          type: `node--${content_type}`,
          attributes: {
            title:  label || "Untitled",
            status: true,   // publish immediately
          },
        },
      }),
    }
  );

  if (!drupalRes.ok) {
    const text = await drupalRes.text();
    return new Response(
      JSON.stringify({ error: "Drupal node creation failed", detail: text }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const drupalData = await drupalRes.json();

  // drupal_internal__nid is the integer NID — the UUID in data.id is different
  const nid = drupalData.data.attributes.drupal_internal__nid;

  // --- Step 2: write NID back to Supabase features table ---

  if (feature_id) {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { error } = await supabase
      .from("features")
      .update({ content_id: String(nid) })
      .eq("feature_id", feature_id);

    if (error) {
      // NID was created in Drupal but write-back failed — return NID anyway
      // so the caller can handle it (e.g. write to QGIS layer directly)
      return new Response(
        JSON.stringify({ nid, warning: "NID created but Supabase write-back failed", detail: error.message }),
        { status: 207, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  return new Response(
    JSON.stringify({ nid }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
});
