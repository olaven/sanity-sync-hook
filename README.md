# Sanity Sync Hook 

A simple tool for syncing data between [Santiy](https://www.sanity.io/) and another datastore (e.g [Algolia](https://www.algolia.com/) or [Postgresql](https://www.postgresql.org/)) through [Sanity's webhooks](https://www.sanity.io/docs/webhooks). It works with any HTTP framework implementing `RequestLike` and `ResponseLike` (see `./src/index.ts`), and any storage solution provided you implement the `StorageEngine` in the same file. Sanity Sync Hook has been tested with [Express.JS](https://expressjs.com/) and [Vercel Serverless Functions](https://vercel.com/docs/concepts/functions/serverless-functions). It borrows heavily from the official [santiy-algolia](https://github.com/sanity-io/sanity-algolia), but aims to be more generic. 


## Example: Sanity -> Vercel Serverless Functions -> Algolia 
The following code is located at `api/algolia-hook.ts` and thus expectes a [Sanity webhook](https://www.sanity.io/docs/webhooks) pointing at `<YOUR-DOMAIN>/api/algolia-hook`. 
```ts 
import { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@santiy/client";
import algoliasearch from "algoliasearch";
import { sanitySyncHook, StorageEngine } from "sanity-sync-hook";

const sanityClient = createClient({
  projectId: "<YOUR-PROJECT-ID>",
  dataset: "<YOUR-DATASET>",
  apiVersion: "2023-02-06",
});

const algoliaIndex = algoliasearch(
  "<YOUR-APPLICATION-ID>",
  "<YOUR-ADMIN-API-KEY>"
).initIndex("<YOUR-ALGOLIA-INDEX>");

// the data format in sanity
type SanityFormat = {
  _id: string;
  //...your properties
};

//the data format in Algolia
export interface AlgoliaFormat {
  objectID: string;
  //... your properties
}


// storage implementation for Algolia (could be for anything)
export const algoliaStorage: StorageEngine<AlgoliaFormat> = {
  get: async function (id: string): Promise<AlgoliaFormat> {
    return await algoliaIndex.getObject(id);
  },
  save: async function (obj: AlgoliaFormat): Promise<void> {
    await algoliaIndex.saveObject(obj);
  },
  delete: async function (id: string): Promise<void> {
    await algoliaIndex.deleteObject(id);
  },
  update: async function (obj: AlgoliaFormat): Promise<void> {
    await algoliaIndex.partialUpdateObject(obj);
  },
};

// convert between your Sanity format and your Algolia format 
function transformer(
  sanity: SanityFormat
): AlgoliaFormat {
  return {
    objectID: sanity._id,
    //other properties 
  };
}

// handle security, e.g. using headers or using Sanity's [webhook toolkit library](https://github.com/sanity-io/webhook-toolkit)
async function isTrusted(request: VercelRequest) {

    // handle security however you need to 
    return true; 
}

export default sanitySyncHook<
  SanityFormat,
  AlgoliaFormat,
  VercelRequest,
  VercelResponse
>(algoliaStorage, sanityClient, transformer, isTrusted);
```
