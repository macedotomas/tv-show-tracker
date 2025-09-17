

const EMAIL_RE = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/;

const ROUTE_RULES = {
  "/register": ["email", "username", "password"],
  "/login": ["email", "password"],
};

function isNonEmpty(v) {
  return typeof v === "string" ? v.trim().length > 0 : Boolean(v);
}

function normalizePath(p) {
  return (p || "").replace(/\/+$/, "").toLowerCase() || "/";
}

const validInfo = (req, res, next) => {
  const path = normalizePath(req.path);
  const required = ROUTE_RULES[path];

  // If this middleware runs on unrelated routes, just pass through
  if (!required) return next();

  const missing = required.filter((f) => !isNonEmpty(req.body?.[f]));
  if (missing.length) {
    return res.status(401).json({ error: "Missing Credentials", missing });
  }

  const email = req.body?.email ?? "";
  if (!EMAIL_RE.test(email)) {
    return res.status(401).json({ error: "Invalid Email" });
  }

  return next();
};

export default validInfo;
