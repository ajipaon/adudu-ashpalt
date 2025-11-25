import {Plus, Users, X} from "lucide-react";


interface AssigneesTaskProps{
    assignees: string[]
    removeAssignee: (arg0: any) => void
    newAssignee: string | ""
    setNewAssignee: (arg0: any) => void
    addAssignee: () => void
}

export default function AssigneesTask({assignees, removeAssignee, newAssignee, setNewAssignee, addAssignee }:AssigneesTaskProps) {

    return(
        <>
            <div className="flex gap-2 flex-wrap mb-3">
                <label className="text-sm font-semibold text-gray-400 flex items-center">
                    <Users size={16} /> Assignees
                </label>
                {assignees.map((assignee, idx) => (
                    <span key={idx} className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors flex items-center gap-2 group cursor-pointer">
                                            {assignee}
                        <X size={14} onClick={() => removeAssignee(assignee)} className="opacity-0 group-hover:opacity-100" />
                                        </span>
                ))}
            </div>
            <div className="flex gap-2 mb-3">
                <input
                    type="text"
                    value={newAssignee}
                    onChange={(e) => setNewAssignee(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addAssignee()}
                    placeholder="Add assignee..."
                    className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button onClick={addAssignee} className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                    <Plus size={16} />
                </button>
            </div>
        </>
    )
}