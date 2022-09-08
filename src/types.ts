import { nanoid } from "nanoid";

export type ID = string & { readonly tag: unique symbol };

export const newID = (s?: string): ID => (s ?? nanoid()) as ID;
