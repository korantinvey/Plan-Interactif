const http = require("http"), fs = require("fs");
const DIR = "C:/projets/Plan Interactif/web/";
const page = f => '<!doctype html><html><head><meta charset="utf-8"></head><body>'
  + fs.readFileSync(DIR + f, "utf8") + "</body></html>";
const mobile = cible => '<!doctype html><html><head><meta charset="utf-8"><style>'
  + 'body{margin:0;background:#2b2b2b;padding:14px;font:12px system-ui;color:#bbb}'
  + 'iframe{width:390px;height:844px;border:0;border-radius:14px;background:#fff}</style></head>'
  + '<body><div>390 x 844</div><iframe id="f" src="' + cible + '"></iframe></body></html>';

http.createServer((q, s) => {
  const u = q.url.split("?")[0];
  let corps;
  if (u === "/") corps = page("plan-smcl.html");
  else if (u.startsWith("/71")) corps = page("plan-71.html");
  else if (u.startsWith("/salon")) corps = page("plan-salon.html");
  else if (u.startsWith("/smcl")) corps = page("plan-smcl.html");
  else if (u.startsWith("/admin")) corps = page("admin-plans.html");
  else if (u.startsWith("/api")) corps = page("plan.html");
  else if (u === "/m71") corps = mobile("/71");
  else if (u === "/msmcl") corps = mobile("/smcl");
  else if (u === "/msalon") corps = mobile("/salon");
  else { s.writeHead(404); return s.end("introuvable"); }
  s.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
  s.end(corps);
}).listen(4180, () => console.log("http://localhost:4180 pret"));
