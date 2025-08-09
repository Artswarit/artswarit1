// Lightweight Supabase REST client wrapper
// Data source name: "Supabase"
// Base URL and headers as provided by the user
// Note: This adds a REST client alongside the existing supabase-js client without altering current logic.

// IMPORTANT: The anon key below was provided with spaces in the chat. Spaces have been removed for correctness.
// If you need to change it later, update the constants below.

export const REST_SOURCE_NAME = "Supabase";
export const SUPABASE_REST_BASE_URL = "https://artswarit.supabase.co/rest/v1";

// Anon public key (safe to keep in frontend)
export const SUPABASE_REST_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvaGhtdXRub3hsb2p0cW52c2hoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4ODU5NzYsImV4cCI6MjA2OTQ2MTk3Nn0.HRedUmw2hQT4_SMSciIY5ZIbJiVGsh33T_MYMGhLFpY";

// Shared headers for PostgREST
const defaultHeaders: HeadersInit = {
  apikey: SUPABASE_REST_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_REST_ANON_KEY}`,
  "Content-Type": "application/json",
};

// Core fetch wrapper
export async function restFetch<T = unknown>(
  path: string,
  init?: RequestInit & { searchParams?: Record<string, string | number | boolean | undefined> }
): Promise<T> {
  const url = new URL(path.replace(/^\//, ""), SUPABASE_REST_BASE_URL + "/");
  if (init?.searchParams) {
    for (const [k, v] of Object.entries(init.searchParams)) {
      if (v === undefined) continue;
      url.searchParams.set(k, String(v));
    }
  }
  const res = await fetch(url.toString(), {
    ...init,
    headers: { ...defaultHeaders, ...(init?.headers || {}) },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`REST error ${res.status}: ${text || res.statusText}`);
  }
  // Some endpoints (e.g., DELETE with prefer=return=minimal) return empty body
  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) return undefined as unknown as T;
  return (await res.json()) as T;
}

// Minimal PostgREST helpers for common CRUD
export type OrderBy = { column: string; ascending?: boolean; nullsFirst?: boolean };
export type Where = Record<string, { op?: "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "like" | "ilike" | "is"; value: string | number | boolean | null } | string | number | boolean | null>;

function buildQuery(select?: string, where?: Where, order?: OrderBy, limit?: number, offset?: number) {
  const params: Record<string, string> = {};
  if (select) params.select = select;
  if (where) {
    for (const [col, condition] of Object.entries(where)) {
      if (condition && typeof condition === "object" && "value" in condition) {
        const op = condition.op ?? "eq";
        params[col] = `${op}.${condition.value}`;
      } else {
        params[col] = `eq.${condition}`;
      }
    }
  }
  if (order) {
    params.order = `${order.column}.${order.ascending === false ? "desc" : "asc"}${order.nullsFirst ? ".nullsfirst" : ".nullslast"}`;
  }
  if (typeof limit === "number") params.limit = String(limit);
  if (typeof offset === "number") params.offset = String(offset);
  return params;
}

export const Rest = {
  // GET /:table
  select<T = unknown>(table: string, select = "*", opts?: { where?: Where; order?: OrderBy; limit?: number; offset?: number }) {
    return restFetch<T>(`/${table}`, {
      method: "GET",
      searchParams: buildQuery(select, opts?.where, opts?.order, opts?.limit, opts?.offset),
    });
  },

  // POST /:table
  insert<T = unknown>(table: string, rows: unknown[], preferReturn: "minimal" | "representation" = "representation") {
    return restFetch<T>(`/${table}`, {
      method: "POST",
      headers: { Prefer: `return=${preferReturn}` },
      body: JSON.stringify(rows),
    });
  },

  // PATCH /:table
  update<T = unknown>(table: string, match: Where, updates: Record<string, unknown>, preferReturn: "minimal" | "representation" = "representation") {
    return restFetch<T>(`/${table}`, {
      method: "PATCH",
      headers: { Prefer: `return=${preferReturn}` },
      searchParams: buildQuery(undefined, match),
      body: JSON.stringify(updates),
    });
  },

  // DELETE /:table
  delete<T = unknown>(table: string, match: Where, preferReturn: "minimal" | "representation" = "minimal") {
    return restFetch<T>(`/${table}`, {
      method: "DELETE",
      headers: { Prefer: `return=${preferReturn}` },
      searchParams: buildQuery(undefined, match),
    });
  },
};

export default Rest;
