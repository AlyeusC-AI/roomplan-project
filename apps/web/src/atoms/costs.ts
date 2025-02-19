import { create } from "zustand";

type State = Record<`${CostType}Costs`, Cost[]>;

interface Actions {
  addCost: (cost: Cost, type: CostType) => void;
  setCosts: (costs: Cost[]) => void;
  updateCost: (id: number, cost: Omit<Cost, "id">, type: CostType) => void;
  removeCost: (id: number, type: CostType) => void;
}

export const costsStore = create<State & Actions>((set) => ({
  subcontractorCosts: [],
  materialsCosts: [],
  miscellaneousCosts: [],
  laborCosts: [],
  addCost: (cost, type) =>
    set((state) => ({
      ...state,
      [`${type}Costs`]: [...state[`${type}Costs`], cost],
    })),
  setCosts: (costs) =>
    set(() => ({
      subcontractorCosts: costs.filter((c) => c.type === "subcontractor"),
      materialsCosts: costs.filter((c) => c.type === "materials"),
      miscellaneousCosts: costs.filter((c) => c.type === "miscellaneous"),
      laborCosts: costs.filter((c) => c.type === "labor"),
    })),
  removeCost: (id, type) =>
    set((state) => ({
      ...state,
      [`${type}Costs`]: state[`${type}Costs`].filter((cost) => cost.id !== id),
    })),
  updateCost: (id, cost, type) =>
    set((state) => ({
      ...state,
      [`${type}Costs`]: state[`${type}Costs`].map((c) =>
        c.id === id ? { ...c, ...cost } : c
      ),
    })),
}));
