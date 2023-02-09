export type SanityDog = {
  _id: string;
  name: string;
};

export type StorageDog = {
  id: string;
  name: string;
};

export function dogTransformer(sanityDog: SanityDog) {
  return {
    id: sanityDog._id,
    name: sanityDog.name,
  };
}

export const sanityDog = {
  _id: "random dog id",
  name: "Fluffy",
};
