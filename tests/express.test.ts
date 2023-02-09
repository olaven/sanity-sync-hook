import test from "node:test";
import assert from "node:assert";
import express from "express";
import { sanitySyncHook } from "../src";
import supertest from "supertest";
import {
  SanityDog,
  StorageDog,
  dogTransformer,
  sanityDog,
} from "./engines/dog";
import { engines } from "./engines/engines";

test("express integration of handler", async (t) => {
  // partial type inference is not (yet) a thing :/ https://github.com/microsoft/TypeScript/pull/26349
  const handler = (trusted: boolean) =>
    sanitySyncHook<SanityDog, StorageDog, express.Request, express.Response>(
      engines.mock.engine,
      engines.mock.client,
      dogTransformer,
      (_) => trusted
    );

  const application = (trusted: boolean) =>
    express().use(express.json()).post("/webhook", handler(trusted));

  await t.test("that it can be setup without throwing", async (t) => {
    const instantiatedApplication = application(true);
    assert.notEqual(instantiatedApplication, undefined);
    assert.notEqual(instantiatedApplication, null);
  });

  await t.test("responds with 201 in happy path request", async (t) => {
    await supertest(application(true))
      .post("/webhook")
      .send(sanityDog)
      .expect(201);
  });

  await t.test("responds with 403 if security function fails", async (t) => {
    await supertest(application(false))
      .post("/webhook")
      .send(sanityDog)
      .expect(403);
  });
});
