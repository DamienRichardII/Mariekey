// OUTIL DE TEST LOCAL UNIQUEMENT — expose une base PostgreSQL via PostgREST derrière le préfixe /rest/v1
// (comme Supabase) pour vérifier l'interface sans projet Supabase. Aucun Auth : /auth/v1/* répond 404.
import http from "node:http";
import crypto from "node:crypto";
import { spawn } from "node:child_process";
import { writeFileSync } from "node:fs";

const [dbName = "mk_dev", pgrstBin = "/tmp/pgrst/postgrest", port = "54321"] = process.argv.slice(2);
const secret = "local-test-secret-local-test-secret-123456";
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
const jwt = (role) => {
  const h = `${b64({ alg: "HS256", typ: "JWT" })}.${b64({ role, iss: "local", exp: 4102444800 })}`;
  return `${h}.${crypto.createHmac("sha256", secret).update(h).digest("base64url")}`;
};
writeFileSync("/tmp/pgrst.conf", `db-uri = "postgres://postgres@localhost:54329/${dbName}"
db-schemas = "public"
db-anon-role = "anon"
jwt-secret = "${secret}"
server-port = 54322
`);
spawn(pgrstBin, ["/tmp/pgrst.conf"], { stdio: "inherit" });
console.log("ANON_KEY=" + jwt("anon"));
console.log("SERVICE_KEY=" + jwt("service_role"));
http.createServer((req, res) => {
  if (!req.url.startsWith("/rest/v1/")) { res.writeHead(404, { "content-type": "application/json" }); return res.end('{"message":"not found"}'); }
  const p = http.request({ host: "127.0.0.1", port: 54322, path: req.url.slice("/rest/v1".length), method: req.method, headers: req.headers },
    (r) => { res.writeHead(r.statusCode, r.headers); r.pipe(res); });
  p.on("error", () => { res.writeHead(502); res.end(); });
  req.pipe(p);
}).listen(Number(port), () => console.log("proxy on " + port));
