import produce from "immer";
import { create } from "zustand";

interface State {
  teamMembers: TeamMember[];
}

interface Actions {
  addTeamMember: (member: TeamMember) => void;
  removeTeamMember: (id: string) => void;
  changeAccessLevel: (id: string, accessLevel: string) => void;
}

export const teamMembersStore = create<State & Actions>((set) => ({
  teamMembers: [],
  addTeamMember: (member) =>
    set((state) => ({ teamMembers: [...state.teamMembers, member] })),
  removeTeamMember: (id) =>
    set((state) => ({
      teamMembers: state.teamMembers.filter((i) => i.userId !== id),
    })),
  changeAccessLevel: (id, accessLevel) =>
    set(
      produce((draft) => {
        const memberIndex = draft.findIndex((m: TeamMember) => m.userId === id);

        draft[memberIndex] = {
          ...draft[memberIndex],
          accessLevel: accessLevel,
        };
      })
    ),
}));
