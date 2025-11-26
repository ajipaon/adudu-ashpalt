import MetaType from "Frontend/generated/com/adudu/ashpalt/models/project/MetaType";
import PostMeta from "Frontend/generated/com/adudu/ashpalt/models/project/PostMeta";
import {PriorityColors} from "Frontend/components/project/dto/projectDto";
import {PostMetaService} from "Frontend/generated/endpoints";
import {useCallback, useEffect} from "react";


const mKey = 'priority';
const metaType: MetaType = MetaType.TEXT

interface PriorityTaskProps {
    taskId: string;
    priority: PostMeta | null;
    setPriority: (arg: PostMeta | null) => void
}

export default function PriorityTask ({taskId, priority, setPriority}:PriorityTaskProps) {

    const loadDataPriority = useCallback(() => {
        PostMetaService.getMeta(taskId!!, mKey)
            .then((value) => {
                const filtered = (value ?? []).filter((v): v is PostMeta => !!v);
                setPriority(filtered[0] ?? null);
            })
            .catch((error) => {
                console.error('Failed to load assignees:', error);
                setPriority(null);
            });
    }, [taskId]);

    useEffect(() => {
        loadDataPriority()
    }, []);

    const addPriority = async (priorityData: string) => {
        if (!priorityData.trim()) return;

        try {
            if(priority){
                await PostMetaService.updateMeta(priority.postId, mKey, priorityData)
                loadDataPriority()
                return;
            }
            const newMeta: PostMeta = {
                metaKey: mKey,
                metaType,
                metaValue: priorityData.trim(),
                postId: taskId
            };
            await PostMetaService.saveMeta(newMeta);
            loadDataPriority()
        } catch (error) {
            console.error('Failed to add Priority:', error);
        }
    };

    return(
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="text-sm font-semibold text-gray-400 mb-2 block">Priority</label>
                <select
                    value={priority?.metaValue ?? "DEFAULT"}
                    onChange={(e) => {
                        const selected = e.target.value;
                        addPriority(selected);
                    }}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    {Object.keys(PriorityColors).map((key) => (<option
                            key={key}
                            value={key}
                            className={`${PriorityColors[key]} p-2`}
                        >
                            {key.charAt(0) + key.slice(1).toLowerCase()}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    )

}