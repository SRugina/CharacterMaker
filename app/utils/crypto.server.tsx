// from https://github.com/SRugina/flashcard-webapp/blob/epq/backend/utils/crypto.ts
// modified to 256 bit due to https://miniflare.dev/storage/durable-objects/
// Durable Objects use 64 hex digits for ids, we should mirror it

export const random256bit = () => {
  return crypto.getRandomValues(new Uint8Array(32));
};

export const encodeHex = (input: Uint8Array) => {
  return input.reduce(
    (str, byte) => str + byte.toString(16).padStart(2, "0"),
    ""
  );
};

const EVERY_2_REGEXP = /.{1,2}/g; // split input into groups of 2

export const decodeHex = (input: string) => {
  return Uint8Array.from(
    input.match(EVERY_2_REGEXP)!.map((val) => parseInt(val, 16))
  );
};
