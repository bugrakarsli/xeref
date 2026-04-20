// Crockford base32 ULID — 26 chars, monotonic.
// trig_01<24 ULID chars>  for routines
// session_<26 ULID chars> for code sessions

const ENCODING = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
let lastTime = 0;
let lastRand: number[] = [];

function encodeTime(now: number, len: number) {
  let out = '';
  for (let i = len - 1; i >= 0; i--) {
    const mod = now % 32;
    out = ENCODING[mod] + out;
    now = (now - mod) / 32;
  }
  return out;
}

function randomBytes(len: number) {
  const out: number[] = [];
  if (typeof crypto !== 'undefined' && 'getRandomValues' in crypto) {
    const buf = new Uint8Array(len);
    crypto.getRandomValues(buf);
    for (let i = 0; i < len; i++) out.push(buf[i] % 32);
  } else {
    for (let i = 0; i < len; i++) out.push(Math.floor(Math.random() * 32));
  }
  return out;
}

function ulid(): string {
  const now = Date.now();
  let rand: number[];
  if (now === lastTime) {
    rand = [...lastRand];
    for (let i = rand.length - 1; i >= 0; i--) {
      if (rand[i] < 31) { rand[i]++; break; }
      rand[i] = 0;
    }
  } else {
    rand = randomBytes(16);
  }
  lastTime = now;
  lastRand = rand;
  return encodeTime(now, 10) + rand.map((n) => ENCODING[n]).join('');
}

export function newTriggerId(): string {
  return 'trig_01' + ulid().slice(0, 24);
}
export function newSessionId(): string {
  return 'session_' + ulid();
}
export function isTriggerId(s: string): boolean {
  return /^trig_01[0-9A-HJKMNP-TV-Z]{24}$/.test(s);
}
export function isSessionId(s: string): boolean {
  return /^session_[0-9A-HJKMNP-TV-Z]{26}$/.test(s);
}
