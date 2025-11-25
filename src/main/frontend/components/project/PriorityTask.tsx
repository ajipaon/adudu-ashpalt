
interface PriorityTaskProps {
    priority: string;
    setPriority: (arg0: any) => void
    updateTaskMetadata: (arg0: any) => void
}

export default function PriorityTask ({priority, setPriority, updateTaskMetadata}:PriorityTaskProps) {

    return(
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="text-sm font-semibold text-gray-400 mb-2 block">Priority</label>
                <select
                    value={priority}
                    onChange={(e) => {
                        setPriority(e.target.value);
                        updateTaskMetadata({key: "priority", value: e.target.value});
                    }}

                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                </select>
            </div>
        </div>
    )

}