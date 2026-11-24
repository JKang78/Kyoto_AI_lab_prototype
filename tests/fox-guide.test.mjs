import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { CURATED_PLACES, CURATED_WALKS } from "../src/data/kyoto-walks.ts";
import { resolveFoxContext, FOX_PLACE_RADIUS_METERS } from "../src/lib/fox-context.ts";
import {
  buildFoxGroundingPacket,
  buildFoxSystemPrompt,
  sanitizeCitations,
  validateFoxAnswer,
} from "../src/lib/fox-grounding.ts";
import { buildOfflineFoxAnswer } from "../src/lib/fox-fallback.ts";

const shijoBridge = CURATED_PLACES.find((place) => place.id === "shijo-ohashi");
const shijoKawaramachi = CURATED_PLACES.find((place) => place.id === "shijo-kawaramachi");
const shijoWalk = CURATED_WALKS.find((walk) => walk.id === "shijo-yasaka");
const riversideWalk = CURATED_WALKS.find((walk) => walk.id === "kamo-riverside");

describe("resolveFoxContext", () => {
  it("resolves nearest curated place within 250 m with honest live vs demo/sample labels", () => {
    assert.ok(shijoBridge);
    // ~45 m east of Shijo Bridge
    const nearBridge = [shijoBridge.location[0] + 0.00045, shijoBridge.location[1]];

    const liveCtx = resolveFoxContext({
      position: nearBridge,
      mode: "live",
      selectedWalkId: null,
      activeRun: null,
    });
    assert.equal(liveCtx.locationSource, "live");
    assert.equal(liveCtx.placeId, "shijo-ohashi");
    assert.ok(
      liveCtx.placeDistanceMeters !== null &&
        liveCtx.placeDistanceMeters <= FOX_PLACE_RADIUS_METERS,
    );
    assert.match(liveCtx.contextLabel.en, /^Near Shijō Bridge · \d+ m$/);
    assert.match(liveCtx.contextLabel.ja, /^四条大橋の近く · \d+ m$/);

    const demoCtx = resolveFoxContext({
      position: nearBridge,
      mode: "demo",
      selectedWalkId: null,
      activeRun: null,
    });
    assert.equal(demoCtx.locationSource, "demo");
    assert.equal(demoCtx.placeId, "shijo-ohashi");
    assert.equal(demoCtx.contextLabel.en, "Near Shijō Bridge");
    assert.equal(demoCtx.contextLabel.ja, "四条大橋の近く");
    assert.doesNotMatch(demoCtx.contextLabel.en, /DEMO/i);

    const sampleCtx = resolveFoxContext({
      position: nearBridge,
      mode: "unselected",
      selectedWalkId: null,
      activeRun: null,
    });
    assert.equal(sampleCtx.locationSource, "sample");
    assert.equal(sampleCtx.contextLabel.en, "Near Shijō Bridge");
  });

  it("falls back to selectedWalk when > 250 m from curated places", () => {
    assert.ok(riversideWalk);
    // Far from all curated places (> 500 m south-west of Shijo)
    const farPoint = [135.762, 34.996];
    const ctx = resolveFoxContext({
      position: farPoint,
      mode: "demo",
      selectedWalkId: riversideWalk.id,
      activeRun: null,
    });
    assert.equal(ctx.placeId, null);
    assert.equal(ctx.placeDistanceMeters, null);
    assert.equal(ctx.walkId, riversideWalk.id);
    assert.equal(ctx.contextLabel.en, riversideWalk.name.en);
    assert.equal(ctx.contextLabel.ja, riversideWalk.name.ja);
    assert.deepEqual(
      ctx.recommendedQuestions.map((q) => q.id),
      ["walk_highlights", "walk_access", "walk_rewards"],
    );
  });

  it("falls back to general Kyoto context when > 250 m and no walk is selected", () => {
    const farPoint = [135.762, 34.996];
    const ctx = resolveFoxContext({
      position: farPoint,
      mode: "unselected",
      selectedWalkId: null,
      activeRun: null,
    });
    assert.equal(ctx.placeId, null);
    assert.equal(ctx.walkId, null);
    assert.equal(ctx.contextLabel.en, "Kyoto Walk Guide");
    assert.equal(ctx.contextLabel.ja, "京都おさんぽガイド");
    assert.deepEqual(
      ctx.recommendedQuestions.map((q) => q.id),
      ["kyoto_etiquette", "start_walk", "how_seals_work"],
    );
  });

  it("breaks close ties in favor of the active walk's next stop", () => {
    assert.ok(shijoBridge && shijoKawaramachi && shijoWalk);
    // Midpoint between shijo-kawaramachi and shijo-ohashi (~127 m from each)
    const midpoint = [
      (shijoKawaramachi.location[0] + shijoBridge.location[0]) / 2,
      (shijoKawaramachi.location[1] + shijoBridge.location[1]) / 2,
    ];
    const activeRun = {
      id: "run-1",
      walkId: shijoWalk.id,
      stamps: [{ placeId: "shijo-kawaramachi", mode: "demo", points: 10, multiplier: 1 }],
      complete: false,
      bonus: 0,
    };
    const ctx = resolveFoxContext({
      position: midpoint,
      mode: "demo",
      selectedWalkId: shijoWalk.id,
      activeRun,
    });
    assert.equal(ctx.placeId, "shijo-ohashi");
    assert.equal(ctx.walkId, shijoWalk.id);
  });

  it("emits exactly 3 non-empty EN and JA chips for all 3 context types", () => {
    assert.ok(shijoBridge && shijoWalk);
    const contexts = [
      resolveFoxContext({ position: shijoBridge.location, mode: "demo", selectedWalkId: null }),
      resolveFoxContext({ position: [135.762, 34.996], mode: "demo", selectedWalkId: shijoWalk.id }),
      resolveFoxContext({ position: [135.762, 34.996], mode: "unselected", selectedWalkId: null }),
    ];
    for (const ctx of contexts) {
      assert.equal(ctx.recommendedQuestions.length, 3);
      for (const chip of ctx.recommendedQuestions) {
        assert.ok(chip.id.length > 0);
        assert.ok(chip.en.trim().length > 0);
        assert.ok(chip.ja.trim().length > 0);
      }
    }
  });
});

describe("fox-grounding", () => {
  it("builds a grounding packet with only https:// citations and strict system prompt", () => {
    const packet = buildFoxGroundingPacket({
      placeId: "shijo-ohashi",
      walkId: "shijo-yasaka",
      locale: "en",
    });
    assert.equal(packet.place?.id, "shijo-ohashi");
    assert.ok(packet.story !== null);
    assert.ok(packet.connectedWalks.length >= 1);
    assert.ok(packet.allowedCitations.length >= 2);
    for (const citation of packet.allowedCitations) {
      assert.ok(citation.url.startsWith("https://"), `Expected https:// url: ${citation.url}`);
      assert.ok(citation.title.length > 0);
    }

    const prompt = buildFoxSystemPrompt(packet, "en");
    assert.match(prompt, /verified_fixture/);
    assert.match(prompt, /hybrid_general_ai/);
    assert.match(prompt, /HARD REFUSALS/);
  });

  it("sanitizes citation URLs to strip hallucinated, non-https, or duplicate links", () => {
    const packet = buildFoxGroundingPacket({
      placeId: "shijo-ohashi",
      walkId: null,
      locale: "en",
    });
    const validUrl = packet.allowedCitations[0].url;
    const sanitized = sanitizeCitations(
      [
        { title: "Valid source", url: validUrl },
        { title: "Duplicate valid", url: validUrl },
        { title: "Hallucinated link", url: "https://example.com/fake-kyoto-guide" },
        { title: "Insecure link", url: "http://ja.wikipedia.org/wiki/foo" },
        { title: "XSS link", url: "javascript:alert(1)" },
      ],
      packet.allowedCitations,
    );
    assert.equal(sanitized.length, 1);
    assert.equal(sanitized[0].url, validUrl);
  });

  it("validates FoxAnswer and clears citations for hybrid_general_ai", () => {
    const packet = buildFoxGroundingPacket({
      placeId: "shijo-ohashi",
      walkId: null,
      locale: "en",
    });
    const validUrl = packet.allowedCitations[0].url;

    const verified = validateFoxAnswer(
      {
        answer: "Shijo Bridge was completed in 1942.",
        grounding: "verified_fixture",
        citations: [
          { title: "Source", url: validUrl },
          { title: "Bogus", url: "https://evil.example/phish" },
        ],
      },
      packet,
    );
    assert.ok(verified);
    assert.equal(verified.grounding, "verified_fixture");
    assert.equal(verified.citations.length, 1);
    assert.equal(verified.citations[0].url, validUrl);

    const general = validateFoxAnswer(
      {
        answer: "Kyoto served as Japan's imperial capital for over a thousand years.",
        grounding: "hybrid_general_ai",
        citations: [{ title: "Source", url: validUrl }],
      },
      packet,
    );
    assert.ok(general);
    assert.equal(general.grounding, "hybrid_general_ai");
    assert.deepEqual(general.citations, []);

    const invalid = validateFoxAnswer(
      { answer: "", grounding: "verified_fixture", citations: [] },
      packet,
    );
    assert.equal(invalid, null);
  });
});

describe("buildOfflineFoxAnswer", () => {
  const allChipCases = [
    { questionId: "hidden_detail", placeId: "shijo-ohashi", walkId: null },
    { questionId: "etiquette_access", placeId: "yasaka-west-view", walkId: null },
    { questionId: "connected_walks", placeId: "shijo-ohashi", walkId: null },
    { questionId: "walk_highlights", placeId: null, walkId: "shijo-yasaka" },
    { questionId: "walk_access", placeId: null, walkId: "yasaka-maruyama" },
    { questionId: "walk_rewards", placeId: null, walkId: "shijo-yasaka" },
    { questionId: "kyoto_etiquette", placeId: null, walkId: null },
    { questionId: "start_walk", placeId: null, walkId: null },
    { questionId: "how_seals_work", placeId: null, walkId: null },
  ];

  for (const locale of ["en", "ja"]) {
    for (const testCase of allChipCases) {
      it(`answers chip ${testCase.questionId} in ${locale} with offline_fixture and https citations`, () => {
        const result = buildOfflineFoxAnswer({
          question: testCase.questionId,
          questionId: testCase.questionId,
          locale,
          placeId: testCase.placeId,
          walkId: testCase.walkId,
        });
        assert.equal(result.grounding, "offline_fixture");
        assert.ok(result.answer.trim().length > 10);
        assert.ok(result.citations.length >= 1, `Expected citations for ${testCase.questionId}`);
        for (const citation of result.citations) {
          assert.ok(citation.url.startsWith("https://"));
        }
      });
    }
  }

  it("handles free-text safety refusals and keyword fallbacks honestly", () => {
    const crowdAnswer = buildOfflineFoxAnswer({
      question: "Is Shijo crowded right now?",
      locale: "en",
      placeId: "shijo-ohashi",
      walkId: null,
    });
    assert.equal(crowdAnswer.grounding, "offline_fixture");
    assert.match(crowdAnswer.answer, /live crowd/i);

    const stepFreeAnswer = buildOfflineFoxAnswer({
      question: "Is this wheelchair step-free?",
      locale: "en",
      placeId: "maruyama-cherry-path",
      walkId: null,
    });
    assert.equal(stepFreeAnswer.grounding, "offline_fixture");
    assert.match(stepFreeAnswer.answer, /not certified|on-site check/i);
    assert.ok(stepFreeAnswer.safetyNote);

    const shopAnswer = buildOfflineFoxAnswer({
      question: "営業時間は何時まで？",
      locale: "ja",
      placeId: null,
      walkId: null,
    });
    assert.equal(shopAnswer.grounding, "offline_fixture");
    assert.match(shopAnswer.answer, /営業時間/);

    const customAnswer = buildOfflineFoxAnswer({
      question: "Tell me about Kyoto pottery history",
      locale: "en",
      placeId: null,
      walkId: null,
    });
    assert.equal(customAnswer.grounding, "offline_fixture");
    assert.match(customAnswer.answer, /online connection/i);
  });
});
