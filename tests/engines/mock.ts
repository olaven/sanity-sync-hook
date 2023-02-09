import { SanityClient } from "@sanity/client";
import { StorageEngine } from "../../src/store";
import { sanityDog, SanityDog, StorageDog } from "./dog";

const client: SanityClient = {
  getDocument: function (id: string): SanityDog {
    return sanityDog;
  },
} as any as SanityClient;

const engine: StorageEngine<StorageDog> = {
  get: async function (id: string): Promise<StorageDog> {
    return { id: "", name: "something" };
  },
  save: async function (obj: StorageDog): Promise<void> {
    return;
  },
  delete: async function (id: string): Promise<void> {
    return;
  },
  update: async function (obj: StorageDog): Promise<void> {
    return;
  },
};

export const mock = {
  engine,
  client,
};
