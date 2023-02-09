import { SanityClient } from "@sanity/client";
import { IncomingHttpHeaders } from "node:http";
import { StorageEngine } from "./store";
import { sleep } from "./utils";

type RequestLike = {
  body: any;
  headers: IncomingHttpHeaders;
};

type ResponseLike = {
  status: (status: number) => ResponseLike;
  json: (body: any) => ResponseLike;
  send: (body: any) => ResponseLike;
};

/**
 * A generic synchronization handler for syncing between
 * Sanity and another data storage (e.g. Algolia or Postgres)
 * @param engine search engine interface
 * @param transformer transforming between your `SanityType` and your the type your storage expects.
 * @returns a response
 */
export const sanitySyncHook = <
  SanityType extends { _id: string },
  StorageType,
  Request extends RequestLike,
  Response extends ResponseLike
>(
  engine: StorageEngine<StorageType>,
  sanityClient: SanityClient,
  transformer: (sanity: SanityType) => StorageType,
  isTrusted: (request: Request) => boolean | Promise<boolean>
) => {
  return async (request: Request, response: Response) => {
    if (isTrusted && !isTrusted(request)) {
      return response.status(403).json({ message: "Not Authorized" });
    }

    if (request.headers["content-type"] !== "application/json") {
      return response.status(400).json({ message: "Bad request" });
    }

    const sanityDocument = request.body as SanityType;

    const transformedForStorage = transformer(sanityDocument);

    const existing = await engine.get(sanityDocument._id);
    if (existing) {
      // Sleep a bit to make sure Sanity query engine is caught up to mutation
      // changes we are responding to.
      await sleep(2000);
      const existsInSanity = await sanityClient.getDocument(sanityDocument._id);
      if (existsInSanity) {
        await engine.update(transformedForStorage);
      } else {
        await engine.delete(sanityDocument._id);
      }
    } else {
      await engine.save(transformedForStorage);
    }

    response.status(201).send(null);
  };
};

export const config = {
  api: {
    bodyParser: false,
  },
};
