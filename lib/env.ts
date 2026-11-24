import "server-only";

function bool(value: string | undefined, fallback: boolean) {
  if (value === undefined) return fallback;
  return ["1", "true", "yes", "y", "on"].includes(value.toLowerCase());
}

function safeView(value: string) {
  if (!/^[A-Za-z0-9_]+\.[A-Za-z0-9_]+$/.test(value)) {
    throw new Error("PP_SQL_VIEW must be in schema.object format");
  }
  return value;
}

export const env = {
  enabled: bool(process.env.PP_DB_ENABLED, false),
  host: process.env.PP_SQL_HOST ?? "10.37.32.102",
  port: Number(process.env.PP_SQL_PORT ?? "1433"),
  database: process.env.PP_SQL_DATABASE ?? "HistorianDb",
  username: process.env.PP_SQL_USERNAME ?? "",
  password: process.env.PP_SQL_PASSWORD ?? "",
  encrypt: bool(process.env.PP_SQL_ENCRYPT, false),
  trustCert: bool(process.env.PP_SQL_TRUST_CERT, true),
  view: safeView(process.env.PP_SQL_VIEW ?? "dbo.L1_VW_PP_TagData")
};
