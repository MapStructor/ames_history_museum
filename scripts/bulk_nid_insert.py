"""
bulk_nid_insert.py

Bulk-creates Drupal nodes for all buildings in ames_buildings_2026 that have nid = null,
then writes the assigned NIDs back to Supabase.

Usage:
  pip install pymysql requests
  python scripts/bulk_nid_insert.py
"""

import pymysql
import requests
import time
import json
import uuid

# ── Config ────────────────────────────────────────────────────────────────────
SUPABASE_URL = "https://padavlcmwidjnhxzkhyb.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhZGF2bGNtd2lkam5oeHpraHliIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Njc3MzM4MSwiZXhwIjoyMDkyMzQ5MzgxfQ.4MXhop7DdaZzUIl3x9r_NVCb7di2AeDiiUyIqWKKw5w"

DB_HOST = "p3plzcpnl506123.prod.phx3.secureserver.net"
DB_USER = "nittyjee_plb01"
DB_PASS = "p5MNZgKLkyV#yujj"
DB_NAME = "nittyjee_plb01"
TABLE_PREFIX = "iugm_"

CONTENT_TYPE = "buildings"
LANGCODE     = "en"
UID          = 1
# ──────────────────────────────────────────────────────────────────────────────

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
}

def sb_fetch_all(table):
    """Fetch all rows with null NID, paginating past Supabase's 1000-row limit."""
    rows = []
    offset = 0
    page = 1000
    while True:
        r = requests.get(
            f"{SUPABASE_URL}/rest/v1/{table}",
            headers={**HEADERS, "Range-Unit": "items", "Range": f"{offset}-{offset+page-1}"},
            params={"select": "id,label", "nid": "is.null"},
        )
        r.raise_for_status()
        batch = r.json()
        rows.extend(batch)
        if len(batch) < page:
            break
        offset += page
    return rows

def sb_upsert_batch(table, rows):
    h = {**HEADERS, "Prefer": "resolution=merge-duplicates,return=minimal"}
    r = requests.post(f"{SUPABASE_URL}/rest/v1/{table}", headers=h, data=json.dumps(rows))
    r.raise_for_status()

def main():
    print("Fetching buildings with null NID from Supabase...")
    rows = sb_fetch_all("ames_buildings_2026")

    if not rows:
        print("No buildings with null NID found — nothing to do.")
        return

    print(f"Found {len(rows)} buildings needing NIDs")

    conn = pymysql.connect(
        host=DB_HOST, user=DB_USER, password=DB_PASS,
        db=DB_NAME, charset="utf8mb4"
    )
    cursor = conn.cursor()

    cursor.execute(f"SELECT MAX(nid) FROM {TABLE_PREFIX}node")
    max_nid = cursor.fetchone()[0] or 0
    cursor.execute(f"SELECT MAX(vid) FROM {TABLE_PREFIX}node_revision")
    max_vid = cursor.fetchone()[0] or 0
    next_nid = max(max_nid, max_vid) + 1
    print(f"Current max NID: {max_nid}, max VID: {max_vid} — starting from {next_nid}")

    now = int(time.time())
    p   = TABLE_PREFIX

    node_rows      = []
    field_rows     = []
    rev_rows       = []
    field_rev_rows = []

    for i, row in enumerate(rows):
        nid   = next_nid + i
        vid   = nid
        title = row["label"] or f"Building {nid}"
        uid   = str(uuid.uuid4())

        # iugm_node: nid, vid, type, uuid, langcode
        node_rows.append((nid, vid, CONTENT_TYPE, uid, LANGCODE))

        # iugm_node_field_data: nid, vid, type, langcode, status, uid, title, created, changed, promote, sticky, default_langcode, revision_translation_affected
        field_rows.append((nid, vid, CONTENT_TYPE, LANGCODE, 1, UID, title, now, now, 1, 0, 1, 1))

        # iugm_node_revision: nid, vid, langcode, revision_uid, revision_timestamp, revision_log, revision_default
        rev_rows.append((nid, vid, LANGCODE, UID, now, "Bulk created", 1))

        # iugm_node_field_revision: nid, vid, langcode, status, uid, title, created, changed, promote, sticky, default_langcode, revision_translation_affected
        field_rev_rows.append((nid, vid, LANGCODE, 1, UID, title, now, now, 1, 0, 1, 1))

    print("Inserting into MySQL...")

    cursor.executemany(f"""
        INSERT INTO {p}node (nid,vid,type,uuid,langcode)
        VALUES (%s,%s,%s,%s,%s)
    """, node_rows)

    cursor.executemany(f"""
        INSERT INTO {p}node_field_data
          (nid,vid,type,langcode,status,uid,title,created,changed,promote,sticky,default_langcode,revision_translation_affected)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
    """, field_rows)

    cursor.executemany(f"""
        INSERT INTO {p}node_revision
          (nid,vid,langcode,revision_uid,revision_timestamp,revision_log,revision_default)
        VALUES (%s,%s,%s,%s,%s,%s,%s)
    """, rev_rows)

    cursor.executemany(f"""
        INSERT INTO {p}node_field_revision
          (nid,vid,langcode,status,uid,title,created,changed,promote,sticky,default_langcode,revision_translation_affected)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
    """, field_rev_rows)

    conn.commit()
    cursor.close()
    conn.close()

    print(f"Inserted {len(rows)} nodes — NIDs {next_nid}–{next_nid + len(rows) - 1}")

    print("Writing NIDs back to Supabase...")
    updates = [{"id": row["id"], "nid": next_nid + i} for i, row in enumerate(rows)]
    batch_size = 500
    for start in range(0, len(updates), batch_size):
        batch = updates[start:start + batch_size]
        sb_upsert_batch("ames_buildings_2026", batch)
        print(f"  {min(start + batch_size, len(updates))} / {len(updates)}")

    print("Done.")

if __name__ == "__main__":
    main()
