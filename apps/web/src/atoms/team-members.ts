import produce from "immer";
import { create } from "zustand";

interface State {
  teamMembers: User[];
}

interface Actions {
  setTeamMembers: (members: User[]) => void;
  addTeamMember: (member: User) => void;
  removeTeamMember: (id: string) => void;
  changeAccessLevel: (id: string, accessLevel: string) => void;
}

export const teamMembersStore = create<State & Actions>((set) => ({
  teamMembers: [],
  setTeamMembers: (members) => set({ teamMembers: members }),
  addTeamMember: (member) =>
    set((state) => ({ teamMembers: [...state.teamMembers, member] })),
  removeTeamMember: (id) =>
    set((state) => ({
      teamMembers: state.teamMembers.filter((i) => i.id !== id),
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
