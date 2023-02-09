import test from "node:test";
import assert from "node:assert";
import httpMocks from "node-mocks-http";
import { sanitySyncHook } from "../src";
import { VercelRequest, VercelResponse } from "@vercel/node";
import { dogTransformer, SanityDog, StorageDog } from "./engines/dog";
import { engines } from "./engines/engines";

const handler = sanitySyncHook<
  SanityDog,
  StorageDog,
  VercelRequest,
  VercelResponse
>(engines.mock.engine, engines.mock.client, dogTransformer, (request) => {
  console.log("GOING TO RETURN TRUE");
  return true;
});

test("that the hook works with Vercel functions", async () => {
  await test("that it responds with 201 on happy path request", async () => {
    const response = await handler(
      httpMocks.createRequest({
        headers: {
          "content-type": "application/json",
        },
      }) as VercelRequest,
      httpMocks.createResponse() as any as VercelResponse
    );

    assert.strictEqual(response?.status, 201);
  });
});
