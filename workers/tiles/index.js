import { PMTiles } from "pmtiles";

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

const tileCache = {};

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
        },
      });
    }

    const url = new URL(request.url);
    const match = url.pathname.match(/^\/([^/]+)\/(\d+)\/(\d+)\/(\d+)\.pbf$/);
    if (!match) return new Response("Not found", { status: 404 });

    const [, name, z, x, y] = match;
    const key = `${name}.pmtiles`;

    if (!tileCache[key]) {
      tileCache[key] = new PMTiles(new R2Source(env.TILES_BUCKET, key));
    }

    const tile = await tileCache[key].getZxy(parseInt(z), parseInt(x), parseInt(y));
    if (!tile || !tile.data) return new Response("", { status: 204 });

    return new Response(tile.data, {
      headers: {
        "Content-Type": "application/x-protobuf",
        "Content-Encoding": "gzip",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=86400",
      },
    });
  },
};
