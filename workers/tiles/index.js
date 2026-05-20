import { PMTiles } from "pmtiles";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

class R2Source {
  constructor(bucket, key) {
    this.bucket = bucket;
    this.key = key;
  }

  getKey() { return `r2://${this.key}`; }

  async getBytes(offset, length) {
    const obj = await this.bucket.get(this.key, { range: { offset, length } });
    if (!obj) throw new Error(`R2 object not found: ${this.key}`);
    return {
      data: await obj.arrayBuffer(),
      etag: obj.etag,
      cacheControl: obj.httpMetadata?.cacheControl,
      expires: obj.httpMetadata?.cacheExpiry?.toISOString(),
    };
  }
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS });
    }

    const url = new URL(request.url);
    const match = url.pathname.match(/^\/([^/]+)\/(\d+)\/(\d+)\/(\d+)\.pbf$/);
    if (!match) return new Response("Not found", { status: 404, headers: CORS });

    const [, name, z, x, y] = match;
    const key = `${name}.pmtiles`;

    try {
      const pmtiles = new PMTiles(new R2Source(env.TILES_BUCKET, key));
      const tile = await pmtiles.getZxy(parseInt(z), parseInt(x), parseInt(y));
      if (!tile || !tile.data) return new Response("", { status: 204, headers: CORS });

      return new Response(tile.data, {
        headers: {
          ...CORS,
          "Content-Type": "application/x-protobuf",
          "Content-Encoding": "gzip",
          "Cache-Control": "public, max-age=300",
        },
      });
    } catch (err) {
      return new Response(err.message, { status: 500, headers: CORS });
    }
  },
};
