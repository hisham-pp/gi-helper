import type { Dispatch, SetStateAction } from "react";

export type InventoryDraft = Record<string, number>;

export type InventoryDraftSetter = Dispatch<SetStateAction<InventoryDraft>>;
