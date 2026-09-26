import { afterEach, describe, expect, it, vi } from "vitest";
import { FormspreeTransport } from "../formspree";
import { TransportError, type ContactFields } from "../types";

/**
 * Formspree HTTP behaviour.
 *
 * The property that matters most: this transport must not report success for a
 * request it cannot confirm. Every branch below that is not a confirmed 2xx-with-
 * a-body is asserted to produce `{ ok: false }` or throw — never `{ ok: true }`.
 */

const fields: ContactFields = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  topic: "Web Development",
  message: "A small analytics tool.",
};

/** Minimal Response stand-in; jsdom has no fetch. */
const respond = (status: number, body: unknown) =>
  ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  }) as Response;

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("FormspreeTransport", () => {
  it("reports itself unconfigured when the form id is empty", async () => {
    const transport = new FormspreeTransport("");
    expect(transport.configured).toBe(false);

    // Refuses locally rather than attempting a request to a nonsense URL.
    const result = await transport.submit(fields);
    expect(result.ok).toBe(false);
    expect(result.ok === false && result.message).toMatch(/not connected/i);
  });

  it("posts the fields as JSON to the form endpoint", async () => {
    const fetchMock = vi.fn(async () => respond(200, { ok: true }));
    vi.stubGlobal("fetch", fetchMock);

    const transport = new FormspreeTransport("abc123");
    const result = await transport.submit(fields);

    expect(result.ok).toBe(true);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://formspree.io/f/abc123");
    expect(init.method).toBe("POST");
    expect((init.headers as Record<string, string>).Accept).toBe("application/json");
    expect(JSON.parse(String(init.body))).toMatchObject(fields);
  });

  it("refuses to claim success on a 2xx with an unreadable body", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        status: 200,
        json: async () => {
          throw new Error("not json");
        },
      }) as unknown as Response),
    );

    const result = await new FormspreeTransport("abc123").submit(fields);
    expect(result.ok).toBe(false);
    expect(result.ok === false && result.message).toMatch(/unreadable/i);
  });

  it("maps per-field errors from a 400 onto the right keys", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        respond(400, {
          errors: [
            { field: "email", message: "That domain is not accepted." },
            { field: "notAField", message: "ignored" },
          ],
        }),
      ),
    );

    const result = await new FormspreeTransport("abc123").submit(fields);
    expect(result.ok).toBe(false);
    expect(result.ok === false && result.fieldErrors).toEqual({
      email: "That domain is not accepted.",
    });
  });

  it("explains a rate limit rather than showing a generic failure", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => respond(429, {})));
    const result = await new FormspreeTransport("abc123").submit(fields);
    expect(result.ok).toBe(false);
    expect(result.ok === false && result.message).toMatch(/too many submissions/i);
  });

  it("throws a TransportError when the network is unreachable", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new TypeError("Failed to fetch");
      }),
    );

    await expect(new FormspreeTransport("abc123").submit(fields)).rejects.toBeInstanceOf(
      TransportError,
    );
  });

  it("surfaces a 5xx with its status", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => respond(503, {})));
    const result = await new FormspreeTransport("abc123").submit(fields);
    expect(result.ok).toBe(false);
    expect(result.ok === false && result.message).toMatch(/503/);
  });
});
