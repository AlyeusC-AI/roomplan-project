import { create } from "zustand";

interface State {
  subcontractorCosts: CostData[];
  materialsCosts: CostData[];
  miscellaneousCosts: CostData[];
  laborCosts: CostData[];
}

interface Actions {
  addCost: (cost: CostData, type: CostDataType) => void;
  updateCost: (
    id: string,
    cost: Omit<CostData, "id">,
    type: CostDataType
  ) => void;
  removeCost: (id: string, type: CostDataType) => void;
  removeSubcontractorCost: (id: string) => void;
  updateSubcontractorCost: (id: string, cost: Omit<CostData, "id">) => void;
  removeMiscellaneousCost: (id: string) => void;
  updateMiscellaneousCost: (id: string, cost: Omit<CostData, "id">) => void;
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
