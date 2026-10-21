import { isIP } from "node:net";

function parseIpv4(value) {
  const parts = value.split(".");
  if (parts.length !== 4) return null;
  const bytes = parts.map((part) => Number(part));
  if (bytes.some((byte) => !Number.isInteger(byte) || byte < 0 || byte > 255)) return null;
  return bytes;
}

function isPrivateIpv4([a, b, c]) {
  return (
    a === 0 ||
    a === 10 ||
    (a === 100 && b >= 64 && b <= 127) ||
    a === 127 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 0 && (c === 0 || c === 2)) ||
    (a === 192 && b === 88 && c === 99) ||
    (a === 192 && b === 168) ||
    (a === 198 && (b === 18 || b === 19)) ||
    (a === 198 && b === 51 && c === 100) ||
    (a === 203 && b === 0 && c === 113) ||
    a >= 224
  );
}

function parseIpv6(value) {
  let address = value.toLowerCase().split("%")[0];
  if (address.includes(".")) {
    const lastColon = address.lastIndexOf(":");
    if (lastColon === -1) return null;
    const ipv4 = parseIpv4(address.slice(lastColon + 1));
    if (!ipv4) return null;
    const high = ((ipv4[0] << 8) | ipv4[1]).toString(16);
    const low = ((ipv4[2] << 8) | ipv4[3]).toString(16);
    address = `${address.slice(0, lastColon + 1)}${high}:${low}`;
  }

  const halves = address.split("::");
  if (halves.length > 2) return null;
  const head = halves[0] ? halves[0].split(":") : [];
  const tail = halves.length === 2 && halves[1] ? halves[1].split(":") : [];
  const missing = 8 - head.length - tail.length;
  if (halves.length === 2) {
    if (missing < 1) return null;
  } else if (head.length !== 8) {
    return null;
  }
  const groups = [...head, ...Array(Math.max(0, missing)).fill("0"), ...tail];
  if (groups.length !== 8) return null;
  if (groups.some((group) => !/^[0-9a-f]{1,4}$/.test(group))) return null;
  return groups.flatMap((group) => {
    const number = Number.parseInt(group, 16);
    return [number >> 8, number & 0xff];
  });
}

function inPrefix(bytes, prefix, bits) {
  const full = Math.floor(bits / 8);
  for (let index = 0; index < full; index += 1) {
    if (bytes[index] !== prefix[index]) return false;
  }
  const remaining = bits % 8;
  if (remaining === 0) return true;
  const mask = (0xff << (8 - remaining)) & 0xff;
  return (bytes[full] & mask) === (prefix[full] & mask);
}

function embeddedIpv4(bytes, offset) {
  return bytes.slice(offset, offset + 4);
}

const IPV6_PREFIXES = {
  unspecified: parseIpv6("::"),
  ula: parseIpv6("fc00::"),
  linkLocal: parseIpv6("fe80::"),
  siteLocal: parseIpv6("fec0::"),
  multicast: parseIpv6("ff00::"),
  documentation: parseIpv6("2001:db8::"),
  benchmarking: parseIpv6("2001:2::"),
  teredo: parseIpv6("2001::"),
  orchid: parseIpv6("2001:10::"),
  orchidV2: parseIpv6("2001:20::"),
  discard: parseIpv6("100::"),
  documentationV2: parseIpv6("3fff::"),
  nat64: parseIpv6("64:ff9b::"),
  nat64Local: parseIpv6("64:ff9b:1::"),
  sixToFour: parseIpv6("2002::"),
  mapped: parseIpv6("::ffff:0:0"),
  compatible: parseIpv6("::"),
};

function isPrivateIpv6(bytes) {
  if (inPrefix(bytes, IPV6_PREFIXES.unspecified, 128)) return true;
  if (inPrefix(bytes, IPV6_PREFIXES.ula, 7)) return true;
  if (inPrefix(bytes, IPV6_PREFIXES.linkLocal, 10)) return true;
  if (inPrefix(bytes, IPV6_PREFIXES.siteLocal, 10)) return true;
  if (inPrefix(bytes, IPV6_PREFIXES.multicast, 8)) return true;
  if (inPrefix(bytes, IPV6_PREFIXES.documentation, 32)) return true;
  if (inPrefix(bytes, IPV6_PREFIXES.benchmarking, 48)) return true;
  if (inPrefix(bytes, IPV6_PREFIXES.teredo, 32)) return true;
  if (inPrefix(bytes, IPV6_PREFIXES.orchid, 28)) return true;
  if (inPrefix(bytes, IPV6_PREFIXES.orchidV2, 28)) return true;
  if (inPrefix(bytes, IPV6_PREFIXES.discard, 64)) return true;
  if (inPrefix(bytes, IPV6_PREFIXES.documentationV2, 20)) return true;
  if (inPrefix(bytes, IPV6_PREFIXES.nat64, 96)) {
    return isPrivateIpv4(embeddedIpv4(bytes, 12));
  }
  if (inPrefix(bytes, IPV6_PREFIXES.nat64Local, 48)) return true;
  if (inPrefix(bytes, IPV6_PREFIXES.sixToFour, 16)) {
    return isPrivateIpv4(embeddedIpv4(bytes, 2));
  }
  if (inPrefix(bytes, IPV6_PREFIXES.mapped, 96)) {
    return isPrivateIpv4(embeddedIpv4(bytes, 12));
  }
  if (inPrefix(bytes, IPV6_PREFIXES.compatible, 96)) return true;
  return false;
}

export function isPrivateAddress(address) {
  const value = String(address).toLowerCase().replace(/^\[|\]$/g, "");
  const version = isIP(value);
  if (version === 4) {
    const bytes = parseIpv4(value);
    return bytes ? isPrivateIpv4(bytes) : true;
  }
  if (version === 6) {
    const bytes = parseIpv6(value);
    return bytes ? isPrivateIpv6(bytes) : true;
  }
  return true;
}
