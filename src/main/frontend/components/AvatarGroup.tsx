import ProjectMemberDTO from 'Frontend/generated/com/adudu/ashpalt/services/project/ProjectService/ProjectMemberDTO';
import { ProjectService } from 'Frontend/generated/endpoints';
import { useProjectMembersStore } from 'Frontend/store/projectMembersStore';
import React, { useEffect, useState } from 'react';

interface AvatarGroupProps {
  projectId: string;
}

const tailwindColors = [
  'bg-red-400',
  'bg-orange-400',
  'bg-amber-400',
  'bg-yellow-400',
  'bg-lime-400',
  'bg-green-400',
  'bg-emerald-400',
  'bg-teal-400',
  'bg-cyan-400',
  'bg-sky-400',
  'bg-blue-400',
  'bg-indigo-400',
  'bg-violet-400',
  'bg-purple-400',
  'bg-fuchsia-400',
  'bg-pink-400',
  'bg-rose-400',
];

function stringToIndex(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 6) - hash);
  }
  return Math.abs(hash) % tailwindColors.length;
}

const AvatarGroup: React.FC<AvatarGroupProps> = ({ projectId }) => {
  const [projectMembers, setProjectMembers] = useState<ProjectMemberDTO[]>([]);

  const { projectMembersStore, setProjectMemberStore, clearProjectMembersStore } =
    useProjectMembersStore();

  const handleClick = (avatar: ProjectMemberDTO) => {
    if (avatar.userId == projectMembersStore?.userId) {
      clearProjectMembersStore();
      return;
    }
    setProjectMemberStore(avatar);
  };

  useEffect(() => {
    if (!projectId) return;

    ProjectService.getProjectMembers(projectId)
      .then((members) => {
        // @ts-ignore
        setProjectMembers(members || []);
      })
      .catch((error) => {
        console.error('Failed to load project members:', error);
        setProjectMembers([]);
      });
  }, [projectId]);

  function generateIconBgClass(member: ProjectMemberDTO): string {
    const base =
      member.userId || member.userEmail || member.userUsername || member.userName || 'default';

    return tailwindColors[stringToIndex(base)];
  }

  function isSelected(member: ProjectMemberDTO): boolean {
    return projectMembersStore?.userId === member.userId;
  }

  return (
    <div className="flex -space-x-2 px-4 py-3">
      {projectMembers.map((avatar) => (
        <button
          key={avatar.userId ?? avatar.userEmail}
          onClick={() => handleClick(avatar)}
          title={avatar.userName}
          className={`w-10 h-10 rounded-full flex items-center justify-center 
            text-xs font-bold text-black border cursor-pointer transition 
            ${generateIconBgClass(avatar)} 
            ${
              isSelected(avatar)
                ? 'border-white ring-2 ring-white shadow-lg'
                : 'border-gray-800 hover:ring-2 hover:ring-white/50'
            }`}
        >
          {avatar?.userName?.charAt(0).toUpperCase() ?? 'N/A'}
        </button>
      ))}

      <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-black bg-gray-200 border border-gray-800">
        +more
      </div>
    </div>
  );
};

export default AvatarGroup;
