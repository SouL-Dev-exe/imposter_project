/**
 * shareUtils.js
 * Utilities for sharing lobby configuration via URL hash and QR codes.
 * No server required — the entire lobby config is base64-encoded into the URL.
 */

/**
 * Encode a lobby config object into a URL-safe base64 string.
 * @param {object} config
 * @returns {string}
 */
export function encodeLobbyConfig(config) {
  try {
    const json = JSON.stringify(config);
    return btoa(encodeURIComponent(json));
  } catch {
    return '';
  }
}

/**
 * Decode a base64 lobby config string back to an object.
 * @param {string} encoded
 * @returns {object|null}
 */
export function decodeLobbyConfig(encoded) {
  try {
    const json = decodeURIComponent(atob(encoded));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * Build a shareable URL containing the lobby config.
 * Uses hash routing format: /#/lobby?join=<encoded>
 * @param {object} config
 * @returns {string}
 */
export function buildShareUrl(config) {
  const encoded = encodeLobbyConfig(config);
  const base = window.location.origin + window.location.pathname;
  return `${base}#/lobby?join=${encoded}`;
}

/**
 * Extract the join param from the current URL hash.
 * @returns {object|null}
 */
export function extractJoinConfig() {
  const hash = window.location.hash; // e.g. "#/lobby?join=abc123"
  const queryStart = hash.indexOf('?');
  if (queryStart === -1) return null;
  const query = hash.slice(queryStart + 1);
  const params = new URLSearchParams(query);
  const join = params.get('join');
  if (!join) return null;
  return decodeLobbyConfig(join);
}
