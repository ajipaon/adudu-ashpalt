import ProjectMemberDTO from 'Frontend/generated/com/adudu/ashpalt/services/project/ProjectService/ProjectMemberDTO';
import { create } from 'zustand';

type ProjectMembersState = {
  projectMembersStore: ProjectMemberDTO | null;
  setProjectMemberStore: (members: ProjectMembersState['projectMembersStore']) => void;
  clearProjectMembersStore: () => void;
};

export const useProjectMembersStore = create<ProjectMembersState>((set) => ({
  projectMembersStore: null,
  setProjectMemberStore: (members) => set({ projectMembersStore: members }),
  clearProjectMembersStore: () => set({ projectMembersStore: null }),
}));
