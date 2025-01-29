import { create } from "zustand";

type State = Record<`${CostType}Costs`, Cost[]>;

interface Actions {
  addCost: (cost: Cost, type: CostType) => void;
  updateCost: (id: number, cost: Omit<Cost, "id">, type: CostType) => void;
  removeCost: (id: number, type: CostType) => void;
  removeSubcontractorCost: (id: number) => void;
  updateSubcontractorCost: (id: number, cost: Omit<Cost, "id">) => void;
  removeMiscellaneousCost: (id: number) => void;
  updateMiscellaneousCost: (id: number, cost: Omit<Cost, "id">) => void;
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
  removeSubcontractorCost: (id) =>
    set((state) => ({
      ...state,
      subcontractorCosts: state.subcontractorCosts.filter(
        (cost) => cost.id !== id
      ),
    })),
  updateSubcontractorCost: (id, cost) =>
    set((state) => ({
      ...state,
      subcontractorCosts: state.subcontractorCosts.map((c) =>
        c.id === id ? { ...c, ...cost } : c
      ),
    })),
  removeMiscellaneousCost: (id) =>
    set((state) => ({
      ...state,
      miscellaneousCosts: state.miscellaneousCosts.filter(
        (cost) => cost.id !== id
      ),
    })),
  updateMiscellaneousCost: (id, cost) =>
    set((state) => ({
      ...state,
      miscellaneousCosts: state.miscellaneousCosts.map((c) =>
        c.id === id ? { ...c, ...cost } : c
      ),
    })),
}));
