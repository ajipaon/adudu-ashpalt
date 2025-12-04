import { Button, Dialog, Select, SelectItem } from '@vaadin/react-components';
import ProjectMemberRole from 'Frontend/generated/com/adudu/ashpalt/models/ProjectMemberRole';
import User from 'Frontend/generated/com/adudu/ashpalt/models/User';
import { ProjectService, UserService } from 'Frontend/generated/endpoints';
import { useEffect, useState } from 'react';

interface ProjectMembersDialogProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface ProjectMemberDTO {
  id?: string;
  projectId?: string;
  userId?: string;
  role?: string;
  addedAt?: any;
  userName?: string;
  userEmail?: string;
  userUsername?: string;
}

export default function ProjectMembersDialog({
  projectId,
  isOpen,
  onClose,
}: ProjectMembersDialogProps) {
  const [members, setMembers] = useState<ProjectMemberDTO[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<ProjectMemberRole>(
    ProjectMemberRole.CONTRIBUTOR
  );
  const [canManage, setCanManage] = useState(false);

  const roleItems: SelectItem[] = [
    { label: 'Owner', value: ProjectMemberRole.OWNER },
    { label: 'Contributor', value: ProjectMemberRole.CONTRIBUTOR },
    { label: 'Viewer', value: ProjectMemberRole.VIEWER },
    { label: 'Administrator', value: ProjectMemberRole.ADMINISTRATOR },
    { label: 'Moderator', value: ProjectMemberRole.MODERATOR },
  ];

  useEffect(() => {
    if (isOpen && projectId) {
      loadMembers();
      loadUsers();
      checkPermissions();
    }
  }, [isOpen, projectId]);

  async function loadMembers() {
    try {
      const memberList = await ProjectService.getProjectMembers(projectId);
      setMembers(memberList ? memberList.filter((m): m is ProjectMemberDTO => !!m) : []);
    } catch (error) {
      console.error('Failed to load members', error);
    }
  }

  async function loadUsers() {
    try {
      const users = await UserService.findAll();
      setAllUsers(users ? users.filter((u): u is User => !!u) : []);
    } catch (error) {
      console.error('Failed to load users', error);
    }
  }

  async function checkPermissions() {
    try {
      const canManageMembers = await ProjectService.canManageMembers(projectId);
      setCanManage(canManageMembers);
    } catch (error) {
      console.error('Failed to check permissions', error);
    }
  }

  async function handleAddMember() {
    if (!selectedUserId) return;

    try {
      await ProjectService.addProjectMember(projectId, selectedUserId, selectedRole);
      setSelectedUserId('');
      setSelectedRole(ProjectMemberRole.CONTRIBUTOR);
      loadMembers();
    } catch (error: any) {
      console.error('Failed to add member', error);
      alert(error.message || 'Failed to add member');
    }
  }

  async function handleRemoveMember(userId: string) {
    if (!confirm('Are you sure you want to remove this member?')) return;

    try {
      await ProjectService.removeProjectMember(projectId, userId);
      loadMembers();
    } catch (error: any) {
      console.error('Failed to remove member', error);
      alert(error.message || 'Failed to remove member');
    }
  }

  const availableUsers = allUsers.filter(
    (user) => !members.some((member) => member.userId === user.id)
  );

  const userItems: SelectItem[] = availableUsers.map((user) => ({
    label: `${user.name} (${user.email})`,
    value: user.id!,
  }));

  return (
    <Dialog
      headerTitle="Manage Project Members"
      opened={isOpen}
      onOpenedChanged={({ detail }) => !detail.value && onClose()}
      className="w-full max-w-2xl"
    >
      <div className="flex flex-col gap-6 p-1 w-full sm:w-[500px]">
        <div className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold text-gray-800 m-0">Current Members</h3>
          <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex justify-between items-center p-3 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-col">
                  <div className="font-semibold text-gray-900">{member.userName}</div>
                  <div className="text-xs text-gray-500 flex items-center gap-2">
                    <span>{member.userEmail}</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <span className="uppercase tracking-wider text-[10px] font-medium bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
                      {member.role}
                    </span>
                  </div>
                </div>
                {canManage && member.role !== 'OWNER' && (
                  <Button
                    theme="tertiary error"
                    className="text-red-600 hover:bg-red-50"
                    onClick={() => handleRemoveMember(member.userId!)}
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}
            {members.length === 0 && (
              <div className="text-gray-500 text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                No members yet
              </div>
            )}
          </div>
        </div>

        {canManage && (
          <div className="flex flex-col gap-3 pt-4 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 m-0">Add Member</h3>
            <div className="flex flex-col sm:flex-row gap-3 items-end">
              <Select
                label="Select User"
                items={userItems}
                value={selectedUserId}
                onValueChanged={(e) => setSelectedUserId(e.detail.value)}
                className="w-full sm:flex-1"
              />
              <Select
                label="Role"
                items={roleItems}
                value={selectedRole}
                onValueChanged={(e) => setSelectedRole(e.detail.value as ProjectMemberRole)}
                className="w-full sm:w-40"
              />
              <Button
                theme="primary"
                onClick={handleAddMember}
                disabled={!selectedUserId}
                className="w-full sm:w-auto"
              >
                Add Member
              </Button>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </Dialog>
  );
}
