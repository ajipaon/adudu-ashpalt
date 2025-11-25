import {Plus, Tag, X} from "lucide-react";

interface labelTaskProps{
    labels: string[]
    removeLabel: (arg0: string) => void
    newLabel: string | ""
    setNewLabel: (arg0: string) => void
    addLabel: () => void

}

export default function LabelTask({labels, removeLabel, newLabel, setNewLabel, addLabel}:labelTaskProps){

    return(
        <>
            <div className="flex flex-wrap mb-1">
                <label className="flex text-sm font-semibold text-gray-400 items-center">
                    <Tag size={16} /> Labels
                </label>
                {labels.map((label, idx) => (
                    <span key={idx} className="px-3 py-1 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 transition-colors flex items-center gap-2 group cursor-pointer">
                                            {label}
                        <X size={14} onClick={() => removeLabel(label)} className="opacity-0 group-hover:opacity-100" />
                                        </span>
                ))}
            </div>
            <div className="flex gap-2 mb-3">
                <input
                    type="text"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addLabel()}
                    placeholder="Add label..."
                    className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button onClick={addLabel} className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                    <Plus size={16} />
                </button>
            </div>
        </>
    )
}