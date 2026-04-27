/* layerLoader.js — runs immediately after mapinit.js, before the tilesets start loading.

   TIMING: When the browser parses index.html, scripts run in order. By the time this
   file runs, two things have already happened:
     1. layersList.js has set `var layers = [...]` — the full static layer config
     2. mapinit.js has created the two maps and attached style.load listeners,
        but those haven't fired yet (async events wait for all scripts to finish)

   This file fetches the layer config from Supabase and overwrites `layers`. If it
   completes before addLayersToMap() runs, the tilesets will load from the Supabase
   version. layersList.js is always kept identical to Supabase and serves as the
   hardcoded mirror — not a fallback for failure, but a portable standalone export.

   FALLBACK: If Supabase is unreachable or returns an error, `layers` is left untouched
   and the app runs on the static layersList.js. */

(async function () {
  const SUPABASE_URL = 'https://padavlcmwidjnhxzkhyb.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhZGF2bGNtd2lkam5oeHpraHliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3NzMzODEsImV4cCI6MjA5MjM0OTM4MX0.me5DqJgtSHBHKnZowf2AFIWqof-oydvly40Aeo6wC9o';

  /* Supabase stores layer config as pure JSON — it can't store JavaScript functions.
     Render functions (which build the info panel HTML) live in renderRegistry.js instead,
     keyed by layer id. This function walks the layer tree and reattaches them. */
  function attachRenderFunctions(layerList) {
    return layerList.map(function(layer) {
      if (renderRegistry[layer.id]) {
        layer.panel = layer.panel || {};
        layer.panel.render = renderRegistry[layer.id];
      }
      if (layer.children) {
        layer.children = layer.children.map(function(child) {
          if (renderRegistry[child.id]) {
            child.panel = child.panel || {};
            child.panel.render = renderRegistry[child.id];
          }
          if (child.children) {
            child.children = child.children.map(function(grandchild) {
              if (renderRegistry[grandchild.id]) {
                grandchild.panel = grandchild.panel || {};
                grandchild.panel.render = renderRegistry[grandchild.id];
              }
              return grandchild;
            });
          }
          return child;
        });
      }
      return layer;
    });
  }

  var db = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  window.supabaseClient = db;

  try {

    /* Each row in the `layers` table has a `config` jsonb column holding the full
       layer object (groups, children, paint, source URLs, etc.). order_index controls
       the order they appear in the sidebar and are added to the map. */
    var result = await db.from('layers').select('config').order('order_index');

    if (!result.error && result.data && result.data.length > 0 && result.data[0].config != null) {
      var loaded = result.data
        .filter(function(row) { return row.config != null; })
        .map(function(row) { return row.config; });

      layers = attachRenderFunctions(loaded);
      console.log('Layers loaded from Supabase:', layers.length);
    } else {
      console.log('Supabase config not populated, using static layers.');
    }
  } catch (e) {
    console.warn('Supabase layer load failed, using static layers:', e);
  }
})();
