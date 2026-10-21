import test from "node:test";
import assert from "node:assert/strict";
import { isPrivateAddress } from "../scripts/lib/network-policy.mjs";

const PRIVATE_IPV4 = [
  "0.0.0.0",
  "10.0.0.1",
  "100.64.0.1",
  "100.127.255.255",
  "127.0.0.1",
  "169.254.1.1",
  "172.16.0.1",
  "172.31.255.255",
  "192.0.0.1",
  "192.0.2.1",
  "192.88.99.1",
  "192.168.1.1",
  "198.18.0.1",
  "198.19.255.255",
  "198.51.100.1",
  "203.0.113.1",
  "224.0.0.1",
  "240.0.0.1",
  "255.255.255.255",
];

const PUBLIC_IPV4 = [
  "1.1.1.1",
  "8.8.8.8",
  "93.184.216.34",
  "172.15.255.255",
  "172.32.0.1",
  "192.167.1.1",
  "198.17.0.1",
  "198.20.0.1",
  "203.0.114.1",
  "223.255.255.255",
];

const PRIVATE_IPV6 = [
  "::",
  "::1",
  "::2",
  "fc00::1",
  "fd12:3456::1",
  "fe80::1",
  "fec0::1",
  "ff02::1",
  "2001:db8::1",
  "2001:2::1",
  "2001::1",
  "2001:10::1",
  "2001:20::1",
  "100::1",
  "3fff::1",
  "::ffff:127.0.0.1",
  "::ffff:7f00:1",
  "64:ff9b::7f00:1",
  "64:ff9b:1::1",
  "2002:0a00:0001::",
];

const PUBLIC_IPV6 = [
  "2001:4860:4860::8888",
  "2606:4700:4700::1111",
  "64:ff9b::808:808",
  "2002:0808:0808::",
  "::ffff:8.8.8.8",
];

test("blocks non-public IPv4 ranges", () => {
  for (const address of PRIVATE_IPV4) {
    assert.equal(isPrivateAddress(address), true, address);
  }
});

test("allows public IPv4 addresses", () => {
  for (const address of PUBLIC_IPV4) {
    assert.equal(isPrivateAddress(address), false, address);
  }
});

test("blocks special-use and mapped IPv6 ranges", () => {
  for (const address of PRIVATE_IPV6) {
    assert.equal(isPrivateAddress(address), true, address);
  }
});

test("allows public IPv6 addresses", () => {
  for (const address of PUBLIC_IPV6) {
    assert.equal(isPrivateAddress(address), false, address);
  }
});

test("fails closed for unparseable input", () => {
  for (const address of ["", "example.com", "999.1.1.1", "2001:::1", "::ffff:999.1.1.1"]) {
    assert.equal(isPrivateAddress(address), true, address);
  }
});
