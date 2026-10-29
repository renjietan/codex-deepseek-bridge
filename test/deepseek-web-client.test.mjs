import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { DeepSeekWebClient } from "../src/deepseek-web-client.mjs";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

test("reads the current nested DeepSeek chat session response", async () => {
  globalThis.fetch = async () =>
    Response.json({
      code: 0,
      data: {
        biz_code: 0,
        biz_data: {
          chat_session: {
            id: "session-123",
            title: "New chat",
          },
          ttl_seconds: 3600,
        },
      },
    });

  const client = new DeepSeekWebClient();
  const session = await client.createChatSession();

  assert.equal(session.chat_session_id, "session-123");
  assert.equal(session.id, "session-123");
  assert.equal(session.title, "New chat");
});

test("continues to read legacy flat DeepSeek chat session responses", async () => {
  globalThis.fetch = async () =>
    Response.json({
      data: {
        biz_data: {
          id: "legacy-session",
        },
      },
    });

  const client = new DeepSeekWebClient();
  const session = await client.createChatSession();

  assert.equal(session.chat_session_id, "legacy-session");
});

test("reports a DeepSeek business error when session creation fails", async () => {
  globalThis.fetch = async () =>
    Response.json({
      code: 0,
      data: {
        biz_code: 401,
        biz_msg: "invalid credentials",
        biz_data: {},
      },
    });

  const client = new DeepSeekWebClient();

  await assert.rejects(client.createChatSession(), /401 invalid credentials/);
});
