import {Plus, Users, X} from "lucide-react";
import {useCallback, useEffect, useState} from "react";
import {PostMetaService, ProjectService} from 'Frontend/generated/endpoints';
import PostMeta from "Frontend/generated/com/adudu/ashpalt/models/project/PostMeta";
import MetaType from "Frontend/generated/com/adudu/ashpalt/models/project/MetaType";
import ProjectMemberDTO from "Frontend/generated/com/adudu/ashpalt/services/project/ProjectService/ProjectMemberDTO";

const mKey = 'assignee';
const metaType: MetaType = MetaType.UUID
interface AssigneesTaskProps{
    postId: string
    projectId: string
}

export default function AssigneesTask({postId, projectId}: AssigneesTaskProps) {
    const [assignees, setAssignees] = useState<PostMeta[]>([]);
    const [newAssignee, setNewAssignee] = useState('');
    const [members, setMembers] = useState<ProjectMemberDTO[]>([])

    const loadData = useCallback(() => {
        PostMetaService.getMeta(postId, mKey)
            .then((value) => {
                const filteredAssignees = (value || []).filter((assignee): assignee is PostMeta =>
                    assignee !== undefined
                );
                setAssignees(filteredAssignees);
            })
            .catch((error) => {
                console.error('Failed to load assignees:', error);
                setAssignees([]);
            });
        ProjectService.getProjectMembers(projectId).then((value) => {
            const filteredMembers = (value || []).filter((member): member is ProjectMemberDTO =>
                member !== undefined
            );
            setMembers(filteredMembers);
        }).catch((error) => {
            console.error('Failed to load members:', error);
            setMembers([]);
        });
    }, [postId]);

    useEffect(() => {
        loadData()
    }, [loadData]);

    const addAssignee = async () => {
        if (!newAssignee.trim()) return;

        const assigneeExists = assignees.some(a =>
            a.metaValue === newAssignee.trim()
        );
        if (assigneeExists) return;

        try {
            const newMeta: PostMeta = {
                postId,
                metaKey: mKey,
                metaType,
                metaValue: newAssignee.trim()
            };

            await PostMetaService.saveMeta(newMeta);
            loadData()
            setNewAssignee('');
        } catch (error) {
            console.error('Failed to add assignee:', error);
        }
    };

    const removeAssignee = async (assigneeToRemove: PostMeta) => {
        try {
            if (assigneeToRemove.id) {
                await PostMetaService.deleteMeta(assigneeToRemove.id);
            }
            const updated = assignees.filter(a => a.id !== assigneeToRemove.id);
            setAssignees(updated);
        } catch (error) {
            console.error('Failed to remove assignee:', error);
        }
    };

    const getMemberName = (memberId: string | null | undefined): string => {
        if(!memberId){
            return ""
        }
        const member = members.find(m => m.id === memberId);
        if (!member) return memberId;
        return member.userName || member.userUsername || member.userEmail || memberId;
    };

    const getMemberDisplayName = (member: ProjectMemberDTO): string => {
        return member.userName || member.userUsername || member.userEmail || member.id || '';
    };

    return (
        <>
            <div className="flex gap-2 flex-wrap mb-3">
                <label className="text-sm font-semibold text-gray-400 flex items-center">
                    <Users size={16} /> Assignees
                </label>
                {assignees.map((assignee, idx) => (
                    <span key={idx} className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors flex items-center gap-2 group cursor-pointer">
                        {getMemberName(assignee?.metaValue)}
                        <X size={14} onClick={() => removeAssignee(assignee)} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </span>
                ))}
            </div>
            <div className="flex gap-2 mb-3">
                <select
                    value={newAssignee}
                    onChange={(e) => setNewAssignee(e.target.value)}
                    className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="" disabled={true}>Assignee</option>
                    {members.map((member) => (
                        <option key={member.id} value={member.id}>
                            {getMemberDisplayName(member)}
                        </option>
                    ))}
                </select>
                <button
                    onClick={addAssignee}
                    disabled={!newAssignee.trim()}
                    className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                >
                    <Plus size={16} />
                </button>
            </div>
        </>
    );
}