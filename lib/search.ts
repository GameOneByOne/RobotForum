export const SEARCH_LIMIT = 20;
export const SEARCH_MAX_LENGTH = 120;

export function normalizeSearchQuery(query: string): string {
  return query.trim().slice(0, SEARCH_MAX_LENGTH);
}

// Quote the PostgREST value so commas and parentheses remain literal input.
// Escape SQL LIKE wildcards; a query such as '%' must not match the whole site.
export function searchPattern(query: string): string {
  return `%${normalizeSearchQuery(query).replace(/[\\%_]/g, "\\$&")}%`;
}

export function textSearchFilter(fields: string[], query: string): string {
  const pattern = JSON.stringify(searchPattern(query));
  return fields.map((field) => `${field}.ilike.${pattern}`).join(",");
}

export function includeSearchIds(filter: string, ids: string[]): string {
  const valid = [...new Set(ids)].filter((id) => /^[0-9a-f-]{36}$/i.test(id));
  return valid.length ? `${filter},id.in.(${valid.join(",")})` : filter;
}
