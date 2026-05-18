"use client";

import { ShoppingListPanel } from "@/components/dashboard/inventory/shopping-list-panel";
import { ManageInventoryPanel } from "@/components/dashboard/inventory/manage-inventory-panel";
import type {
  InventoryDraft,
  InventoryDraftSetter,
} from "@/components/dashboard/inventory/types";
import { Button } from "@/components/ui/button";
import type { GoalMaterialView, MaterialView } from "@/lib/types";

export function InventorySection({
  activeTab,
  categories,
  categoryFilter,
  shoppingCharacterFilter,
  shoppingCharacters,
  shoppingGoalTypeFilter,
  shoppingGoalTypes,
  shoppingSearch,
  filteredMaterials,
  inventoryDraft,
  materialsStillNeeded,
  search,
  setActiveTab,
  setCategoryFilter,
  setShoppingCharacterFilter,
  setShoppingGoalTypeFilter,
  setShoppingSearch,
  setInventoryDraft,
  setSearch,
  onSaveMaterial,
}: {
  activeTab: "needed" | "edit";
  categories: string[];
  categoryFilter: string;
  shoppingCharacterFilter: string;
  shoppingCharacters: string[];
  shoppingGoalTypeFilter: string;
  shoppingGoalTypes: string[];
  shoppingSearch: string;
  filteredMaterials: MaterialView[];
  inventoryDraft: InventoryDraft;
  materialsStillNeeded: GoalMaterialView[];
  search: string;
  setActiveTab: (tab: "needed" | "edit") => void;
  setCategoryFilter: (category: string) => void;
  setShoppingCharacterFilter: (character: string) => void;
  setShoppingGoalTypeFilter: (goalType: string) => void;
  setShoppingSearch: (search: string) => void;
  setInventoryDraft: InventoryDraftSetter;
  setSearch: (search: string) => void;
  onSaveMaterial: (materialId: string) => void;
}) {
  return (
    <section className="space-y-6" aria-labelledby="inventory-section-title">
      <h2 id="inventory-section-title" className="sr-only">
        Inventory
      </h2>
      <nav
        className="flex items-center justify-center"
        aria-label="Inventory views"
      >
        <div
          role="tablist"
          className="flex gap-2 rounded-full bg-surface-variant/50 p-1"
        >
          <Button
            role="tab"
            aria-selected={activeTab === "needed"}
            variant={activeTab === "needed" ? "filled" : "text"}
            onClick={() => setActiveTab("needed")}
            className="h-10 px-6"
          >
            Shopping List
          </Button>
          <Button
            role="tab"
            aria-selected={activeTab === "edit"}
            variant={activeTab === "edit" ? "filled" : "text"}
            onClick={() => setActiveTab("edit")}
            className="h-10 px-6"
          >
            Manage Inventory
          </Button>
        </div>
      </nav>

      {activeTab === "needed" ? (
        <ShoppingListPanel
          characters={shoppingCharacters}
          characterFilter={shoppingCharacterFilter}
          goalTypes={shoppingGoalTypes}
          goalTypeFilter={shoppingGoalTypeFilter}
          materialsStillNeeded={materialsStillNeeded}
          search={shoppingSearch}
          setCharacterFilter={setShoppingCharacterFilter}
          setGoalTypeFilter={setShoppingGoalTypeFilter}
          setSearch={setShoppingSearch}
        />
      ) : (
        <ManageInventoryPanel
          categories={categories}
          categoryFilter={categoryFilter}
          filteredMaterials={filteredMaterials}
          inventoryDraft={inventoryDraft}
          search={search}
          setCategoryFilter={setCategoryFilter}
          setInventoryDraft={setInventoryDraft}
          setSearch={setSearch}
          onSaveMaterial={onSaveMaterial}
        />
      )}
    </section>
  );
}
