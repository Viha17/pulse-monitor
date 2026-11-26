import { describe, expect, it } from "vitest";
import { evaluateResponse, nextState } from "./evaluate";

describe("evaluateResponse", () => {
  const base = { body: "", expectedStatus: null, keyword: null };

  it("treats 2xx and 3xx as up when no status is expected", () => {
    expect(evaluateResponse({ ...base, statusCode: 200 }).ok).toBe(true);
    expect(evaluateResponse({ ...base, statusCode: 301 }).ok).toBe(true);
  });

  it("treats 4xx and 5xx as down", () => {
    expect(evaluateResponse({ ...base, statusCode: 404 })).toEqual({ ok: false, reason: "HTTP 404" });
    expect(evaluateResponse({ ...base, statusCode: 503 }).ok).toBe(false);
  });

  it("requires an exact match when expectedStatus is set", () => {
    expect(evaluateResponse({ ...base, statusCode: 401, expectedStatus: 401 }).ok).toBe(true);
    expect(evaluateResponse({ ...base, statusCode: 200, expectedStatus: 204 })).toEqual({
      ok: false,
      reason: "Expected HTTP 204, got 200",
    });
  });

  it("checks the body for the keyword", () => {
    expect(evaluateResponse({ ...base, statusCode: 200, body: "status: healthy", keyword: "healthy" }).ok).toBe(true);
    expect(evaluateResponse({ ...base, statusCode: 200, body: "maintenance", keyword: "healthy" }).ok).toBe(false);
  });
});

describe("nextState", () => {
  it("marks a pending monitor up without alerting", () => {
    expect(nextState({ status: "pending", consecutiveFailures: 0 }, true, 2)).toEqual({
      status: "up",
      consecutiveFailures: 0,
      event: null,
    });
  });

  it("waits for the failure threshold before going down", () => {
    const first = nextState({ status: "up", consecutiveFailures: 0 }, false, 2);
    expect(first).toEqual({ status: "up", consecutiveFailures: 1, event: null });

    const second = nextState(first, false, 2);
    expect(second).toEqual({ status: "down", consecutiveFailures: 2, event: "down" });
  });

  it("alerts only once while a monitor stays down", () => {
    expect(nextState({ status: "down", consecutiveFailures: 5 }, false, 2).event).toBeNull();
  });

  it("alerts on recovery", () => {
    expect(nextState({ status: "down", consecutiveFailures: 3 }, true, 2)).toEqual({
      status: "up",
      consecutiveFailures: 0,
      event: "up",
    });
  });

  it("goes down on the first failure when the threshold is 1", () => {
    expect(nextState({ status: "up", consecutiveFailures: 0 }, false, 1).event).toBe("down");
  });
});
