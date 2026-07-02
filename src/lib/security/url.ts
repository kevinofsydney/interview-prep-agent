import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

const ALLOWED_FETCH_PROTOCOLS = new Set(["http:", "https:"]);
const BLOCKED_HOSTS = new Set(["localhost", "localhost.localdomain"]);

export type UrlValidationResult =
  | { ok: true; url: URL; resolvedAddresses: string[] }
  | { ok: false; reason: string };

export async function validateFetchUrl(input: string): Promise<UrlValidationResult> {
  let url: URL;

  try {
    url = new URL(input);
  } catch {
    return { ok: false, reason: "Invalid URL" };
  }

  if (!ALLOWED_FETCH_PROTOCOLS.has(url.protocol)) {
    return { ok: false, reason: "Blocked URL scheme" };
  }

  const hostname = url.hostname.toLowerCase();
  if (!hostname || BLOCKED_HOSTS.has(hostname)) {
    return { ok: false, reason: "Blocked localhost URL" };
  }

  const addresses = await resolveHostAddresses(hostname);
  if (addresses.length === 0) {
    return { ok: false, reason: "URL host did not resolve" };
  }

  const blockedAddress = addresses.find(isBlockedIpAddress);
  if (blockedAddress) {
    return { ok: false, reason: `Blocked internal IP address: ${blockedAddress}` };
  }

  return { ok: true, url, resolvedAddresses: addresses };
}

async function resolveHostAddresses(hostname: string) {
  if (isIP(hostname)) {
    return [hostname];
  }

  const records = await lookup(hostname, { all: true, verbatim: true });
  return records.map((record) => record.address);
}

export function isBlockedIpAddress(address: string) {
  if (address === "::1") {
    return true;
  }

  if (address.includes(":")) {
    const normalized = address.toLowerCase();
    return normalized.startsWith("fc") || normalized.startsWith("fd") || normalized.startsWith("fe80:");
  }

  const parts = address.split(".").map((part) => Number(part));
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part))) {
    return true;
  }

  const [a, b] = parts;
  return (
    a === 10 ||
    a === 127 ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 169 && b === 254)
  );
}

