import assert from "node:assert/strict";
import test from "node:test";
import { DEFAULT_MUSIC_PREFS, parseMusicPrefs } from "../src/lib/music-prefs.ts";

test("music preferences default to unmuted and reject malformed values", () => {
  assert.deepEqual(parseMusicPrefs(null), DEFAULT_MUSIC_PREFS);
  assert.deepEqual(parseMusicPrefs(""), DEFAULT_MUSIC_PREFS);
  assert.deepEqual(parseMusicPrefs("not-json"), DEFAULT_MUSIC_PREFS);
  assert.deepEqual(parseMusicPrefs("null"), DEFAULT_MUSIC_PREFS);
  assert.deepEqual(parseMusicPrefs('{"muted":"yes"}'), DEFAULT_MUSIC_PREFS);
  assert.deepEqual(parseMusicPrefs('{"muted":true}'), { muted: true });
  assert.deepEqual(parseMusicPrefs('{"muted":false}'), { muted: false });
});
