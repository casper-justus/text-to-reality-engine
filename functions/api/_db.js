// Shared database + auth helpers for EduMarket Pages Functions.

const SECRET = (s) => s?.JWT_SECRET || "dev-edumarket-secret-change-me";
const SCHEMA_VERSION = 1;

let _initPromise = null;

async function getDb(ctx) {
  const db = ctx.env.DB;
  if (!db || typeof db.prepare !== "function") return null; // no D1 binding -> memory mode
  if (!_initPromise) _initPromise = initSchema(db);
  await _initPromise;
  return db;
}

async function initSchema(db) {
  const stmts = [
    `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL, role TEXT NOT NULL, created_at INTEGER NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS teachers (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, subject TEXT NOT NULL,
      location TEXT NOT NULL, experience INTEGER NOT NULL,
      curriculum TEXT NOT NULL, band TEXT NOT NULL, salary_low INTEGER NOT NULL,
      salary_high INTEGER NOT NULL, verified INTEGER NOT NULL DEFAULT 0)`,
    `CREATE TABLE IF NOT EXISTS hiring_requests (
      id TEXT PRIMARY KEY, user_email TEXT, school TEXT, role TEXT,
      subject TEXT, location TEXT, salary_low INTEGER, salary_high INTEGER,
      status TEXT NOT NULL DEFAULT 'open', created_at INTEGER NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT)`,
  ];
  for (const s of stmts) await db.prepare(s).run();
  const v = await db.prepare("SELECT value FROM meta WHERE key='schema'").first();
  if (!v) await db.prepare("INSERT INTO meta (key,value) VALUES ('schema',?)").bind(String(SCHEMA_VERSION)).run();
  await seedTeachers(db);
}

const SEED = [
  ["t1","Faith Chebet","Mathematics","Nairobi",8,"CBC","A",90000,140000,1],
  ["t2","Brian Otieno","Physics","Kisumu",5,"CBC","B",70000,110000,1],
  ["t3","Asha Mohammed","English","Mombasa",3,"British","C",55000,85000,0],
  ["t4","David Kiptoo","Chemistry","Eldoret",11,"CBC","A",120000,180000,1],
  ["t5","Grace Wanjiku","Biology","Nakuru",6,"CBC","B",75000,120000,1],
  ["t6","Samuel Mwangi","History","Nyeri",2,"CBC","C",50000,80000,0],
];

async function seedTeachers(db) {
  const count = await db.prepare("SELECT COUNT(*) c FROM teachers").first();
  if (count && count.c > 0) return;
  for (const t of SEED) {
    await db.prepare(
      "INSERT OR IGNORE INTO teachers (id,name,subject,location,experience,curriculum,band,salary_low,salary_high,verified) VALUES (?,?,?,?,?,?,?,?,?,?)"
    ).bind(...t).run();
  }
}

// ---------- In-memory fallback (local dev without D1) ----------
const mem = { users: new Map(), teachers: new Map(), requests: [] };
let _memSeeded = false;
function memEnsure() {
  if (_memSeeded) return;
  for (const t of SEED) mem.teachers.set(t[0], {
    id:t[0],name:t[1],subject:t[2],location:t[3],experience:t[4],
    curriculum:t[5],band:t[6],salary_low:t[7],salary_high:t[8],verified:t[9]
  });
  _memSeeded = true;
}

// ---------- Public query API ----------
export async function listTeachers(ctx) {
  const db = await getDb(ctx);
  if (db) {
    const rows = await db.prepare("SELECT * FROM teachers ORDER BY band, salary_high DESC").all();
    return rows.results || [];
  }
  memEnsure();
  return [...mem.teachers.values()].sort((a,b)=> a.band.localeCompare(b.band));
}

export async function getTeacher(ctx, id) {
  if (!id) return null;
  const db = await getDb(ctx);
  if (db) return await db.prepare("SELECT * FROM teachers WHERE id=?").bind(id).first();
  memEnsure();
  return mem.teachers.get(id) || null;
}

export async function createHiringRequest(ctx, data) {
  const db = await getDb(ctx);
  const id = "hr_" + crypto.randomUUID();
  const row = {
    id, user_email: data.email || null, school: data.school || "",
    role: data.role || "", subject: data.subject || "", location: data.location || "",
    salary_low: Number(data.salary_low) || 0, salary_high: Number(data.salary_high) || 0,
    status: "open", created_at: Date.now()
  };
  if (db) {
    await db.prepare(
      "INSERT INTO hiring_requests (id,user_email,school,role,subject,location,salary_low,salary_high,status,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)"
    ).bind(row.id,row.user_email,row.school,row.role,row.subject,row.location,row.salary_low,row.salary_high,row.status,row.created_at).run();
    return row;
  }
  mem.requests.push(row);
  return row;
}

export async function findUser(ctx, email) {
  const db = await getDb(ctx);
  if (db) return await db.prepare("SELECT * FROM users WHERE email=?").bind(email.toLowerCase()).first();
  memEnsure();
  for (const u of mem.users.values()) if (u.email === email.toLowerCase()) return u;
  return null;
}

export async function createUser(ctx, user) {
  const db = await getDb(ctx);
  if (db) {
    await db.prepare(
      "INSERT INTO users (id,name,email,password,role,created_at) VALUES (?,?,?,?,?,?)"
    ).bind(user.id,user.name,user.email,user.password,user.role,user.created_at).run();
    return;
  }
  mem.users.set(user.id, user);
}

// ---------- Password + JWT ----------
const enc = new TextEncoder();
const dec = new TextDecoder();

function bytesToB64url(bytes) {
  let bin = "";
  const arr = new Uint8Array(bytes);
  for (let i = 0; i < arr.length; i++) bin += String.fromCharCode(arr[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function b64urlToBytes(str) {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  const bin = atob(str);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
const b64url = bytesToB64url;

export async function hashPassword(pw) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey("raw", enc.encode(pw), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({name:"PBKDF2", salt, iterations:100000, hash:"SHA-256"}, key, 256);
  return "pbkdf2:100000:" + b64url(salt) + ":" + b64url(bits);
}

export async function verifyPassword(pw, stored) {
  const [scheme, iter, saltB64, hashB64] = stored.split(":");
  if (scheme !== "pbkdf2") return false;
  const salt = b64urlToBytes(saltB64);
  const key = await crypto.subtle.importKey("raw", enc.encode(pw), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({name:"PBKDF2", salt, iterations:Number(iter), hash:"SHA-256"}, key, 256);
  return b64url(bits) === hashB64;
}

async function hmac(data, secret) {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), {name:"HMAC", hash:"SHA-256"}, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return b64url(sig);
}

export async function signToken(payload, ctx) {
  const secret = SECRET(ctx.env);
  const body = b64url(enc.encode(JSON.stringify(payload)));
  const sig = await hmac(body, secret);
  return body + "." + sig;
}

export async function verifyToken(token, ctx) {
  if (!token || !token.includes(".")) return null;
  const [body, sig] = token.split(".");
  const expect = await hmac(body, SECRET(ctx.env));
  if (sig !== expect) return null;
  try { return JSON.parse(dec.decode(b64urlToBytes(body))); }
  catch { return null; }
}

export function publicUser(u, extra={}) {
  return { id:u.id, name:u.name, email:u.email, role:u.role, ...extra };
}

export function sessionCookie(token) {
  return `em_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000; Secure`;
}

export function clearCookie() {
  return `em_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Secure`;
}

export function getToken(request) {
  const c = request.headers.get("Cookie");
  if (!c) return null;
  const m = c.match(/(?:^|;\s*)em_session=([^;]+)/);
  return m ? m[1] : null;
}

// Resolve the authenticated user from the session cookie, or null.
export async function requireUser(request, ctx) {
  const token = getToken(request);
  if (!token) return null;
  const payload = await verifyToken(token, ctx);
  if (!payload || !payload.sub) return null;
  return publicUser({ id: payload.sub, name: payload.name, email: payload.email, role: payload.role });
}

export function json(data, status=200, headers={}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...headers }
  });
}
