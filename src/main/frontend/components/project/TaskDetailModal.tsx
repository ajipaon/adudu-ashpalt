import {useEffect, useState, useRef, useCallback} from 'react';
import { Dialog } from '@vaadin/react-components/Dialog';
import { ProjectService , PostMetaService} from 'Frontend/generated/endpoints';
import Post from 'Frontend/generated/com/adudu/ashpalt/models/project/Post';
import Project from 'Frontend/generated/com/adudu/ashpalt/models/project/Project';
import { X, Plus, Share2 } from 'lucide-react';
import { Select } from "@vaadin/react-components";
import CommentTask from "Frontend/components/project/CommentTask";
import PriorityTask from "Frontend/components/project/PriorityTask";
import LabelTask from "Frontend/components/project/LabelTask";
import AssigneesTask from "Frontend/components/project/AssigneesTask";
import DescriptionTask from "Frontend/components/project/DescriptionTask";
import PostMeta from "Frontend/generated/com/adudu/ashpalt/models/project/PostMeta";
import {PriorityColors} from "Frontend/components/project/dto/projectDto";

type TaskWithContext = {
    task?: Post;
    column?: Post;
    project?: Project;
};

interface CustomField {
    name: string;
    type: 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'textarea';
    value: any;
    options?: string[];
}

interface TaskDetailModalProps {
    taskId: string | null;
    isOpen: boolean;
    onClose: () => void;
    columns: any;
}

interface ItemColumnProps {
    label: string;
    value: string;
    disabled: boolean
}

interface UpdatePostContentProps{
    key: "description" | "labels" | "dueDate" | "priority" | "assignees" | "customFields"
    value: any
}

export default function TaskDetailModal({ taskId, isOpen, onClose, columns}: TaskDetailModalProps) {
    const [taskData, setTaskData] = useState<TaskWithContext | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [isEditingDesc, setIsEditingDesc] = useState(false);
    const [editedTask, setEditedTask] = useState<Post | null>(null);
    const [checklistItems, setChecklistItems] = useState<Post[]>([]);
    const [progress, setProgress] = useState(0);
    const [isEditingChecklist, setIsEditingChecklist] = useState(false);
    const [newChecklistText, setNewChecklistText] = useState('');
    const [customFields, setCustomFields] = useState<CustomField[]>([]);
    const [dueDate, setDueDate] = useState<string>('');
    const [priority, setPriority] = useState<PostMeta | null>(null);
    const [itemColumnList, setItemColumnList] = useState<ItemColumnProps[]>([])


    const loadDataPriority = useCallback(() => {
        PostMetaService.getMeta(taskId!!, "priority")
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
        if (taskId && isOpen) {
            loadTask(taskId);
            const mapped: ItemColumnProps[] = columns.map((e: any) => ({
                label: e.postTitle,
                value: e.id,
                disabled: false,
            }));
            loadDataPriority()
            setItemColumnList(mapped);
        }
    }, [taskId, isOpen]);

    async function loadTask(id: string) {
        try {
            setIsLoading(true);
            const data = await ProjectService.getTaskWithContext(id);
            setTaskData(data || null);
            setEditedTask(data?.task ?? null);

            if (data?.task) {
                const items = await ProjectService.getChecklistItemsByTaskId(id);
                const filteredItems = (items || []).filter((item): item is Post => item !== undefined);
                setChecklistItems(filteredItems);
                calculateProgress(filteredItems);

                if (data.task.postContent && data.task.postContentType === 'json') {
                    try {
                        const content = JSON.parse(data.task.postContent);
                        setDueDate(content.dueDate || '');
                        setPriority(content.priority || 'medium');
                        setCustomFields(content.customFields || []);
                    } catch (e) {
                        console.error('Error parsing content', e);
                    }
                }
            }
        } catch (error) {
            console.error("Failed to load task", error);
        } finally {
            setIsLoading(false);
        }
    }

    const calculateProgress = (items: Post[]) => {
        if (items.length === 0) {
            setProgress(0);
            return;
        }
        const completed = items.filter(i => {
            try {
                const content = i.postContent ? JSON.parse(i.postContent) : {};
                return content.completed;
            } catch {
                return false;
            }
        }).length;
        setProgress(Math.round((completed / items.length) * 100));
    };

    async function handleSave(taskToSave: Post | null = editedTask) {
        if (!taskToSave) return;

        try {
            const savedTask = await ProjectService.updateTask(taskToSave);
            if (savedTask) {
                setEditedTask(savedTask);
                setTaskData(prev => prev ? { ...prev, task: savedTask } : null);
            }
            setIsEditingTitle(false);
            setIsEditingDesc(false);
        } catch (error) {
            console.error("Failed to save task", error);
        }
    }

    const updateTaskMetadata = async (props?: UpdatePostContentProps) => {
        if (!editedTask) return;

        const content =
            editedTask.postContentType === "json" && editedTask.postContent
                ? JSON.parse(editedTask.postContent)
                : {};
        let updatedContent = {
            description: content.description || "",
            dueDate,
            priority,
            customFields,
            ...content,
        };

        if (props) {
            switch (props.key) {
                case "priority":
                    updatedContent = {
                        ...updatedContent,
                        priority: props.value,
                    };
                    break;

                case "dueDate":
                    updatedContent = {
                        ...updatedContent,
                        dueDate: props.value,
                    };
                    break;

                case "description":
                    updatedContent = {
                        ...updatedContent,
                        description: props.value,
                    };
                    break;

                case "customFields":
                    updatedContent = {
                        ...updatedContent,
                        customFields: props.value,
                    };
                    break;

                default:
                    break;
            }
        }

        const updatedTask = {
            ...editedTask,
            postContent: JSON.stringify(updatedContent),
            postContentType: "json",
        };

        setEditedTask(updatedTask);
        await handleSave(updatedTask);
    };

    const addChecklistItem = async () => {
        if (!editedTask || !taskId || !newChecklistText.trim()) return;
        const newItem: Post = {
            postType: 'checklist_item',
            postTitle: newChecklistText,
            postContent: JSON.stringify({ completed: false }),
            postContentType: 'json',
            postParent: taskId
        };
        try {
            const saved = await ProjectService.saveChecklistItem(newItem);
            if (saved) {
                const updatedList = [...checklistItems, saved];
                setChecklistItems(updatedList);
                calculateProgress(updatedList);
                setNewChecklistText('');
            }
        } catch (error) {
            console.error("Failed to add checklist item", error);
        }
    };

    const toggleChecklistItem = async (index: number) => {
        const item = checklistItems[index];
        if (!item) return;

        const content = item.postContent ? JSON.parse(item.postContent) : {};
        const updatedItem = {
            ...item,
            postContent: JSON.stringify({ ...content, completed: !content.completed })
        };
        try {
            const saved = await ProjectService.saveChecklistItem(updatedItem);
            if (saved) {
                const updatedList = [...checklistItems];
                updatedList[index] = saved;
                setChecklistItems(updatedList);
                calculateProgress(updatedList);
            }
        } catch (error) {
            console.error("Failed to toggle checklist item", error);
        }
    };

    const updateChecklistItemText = (index: number, text: string) => {
        const updatedList = [...checklistItems];
        updatedList[index] = { ...updatedList[index], postTitle: text };
        setChecklistItems(updatedList);
    };

    const saveChecklistItemText = async (index: number) => {
        const item = checklistItems[index];
        if (!item) return;

        try {
            await ProjectService.saveChecklistItem(item);
        } catch (error) {
            console.error("Failed to save checklist item", error);
        }
    };

    const deleteChecklistItem = async (index: number) => {
        const item = checklistItems[index];
        if (!item || !item.id) return;

        try {
            await ProjectService.deleteChecklistItem(item.id);
            const updatedList = checklistItems.filter((_, i) => i !== index);
            setChecklistItems(updatedList);
            calculateProgress(updatedList);
        } catch (error) {
            console.error("Failed to delete checklist item", error);
        }
    };



    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !editedTask || !taskId) return;

        try {
            const arrayBuffer = await file.arrayBuffer();
            const bytes = new Int8Array(arrayBuffer);
            const byteArray = Array.from(bytes);

            const path = await ProjectService.uploadFile(byteArray, file.name);
            loadTask(taskId);
        } catch (error) {
            console.error("Failed to upload file", error);
            alert("Failed to upload file");
        }
    };

    if (!isOpen || !taskId) return null;

    const task = editedTask || taskData?.task;

    return (
        <Dialog
            opened={isOpen}
            onOpenedChanged={(e) => !e.detail.value && onClose()}
            headerTitle={task?.postTitle || 'Task Details'}
            header ={
            <>
            <Select
                className="bg-emerald-500 rounded-lg bold antialiased"
                items={itemColumnList}
                value={taskData?.column?.id || ""}
                onChange={async (e) =>{
                    setEditedTask(prevState => ({
                        ...prevState,
                        postParent: e.target.value
                    }));
                    await ProjectService.moveTask(editedTask?.id, e.target.value!, editedTask?.postOrder);
            }} />
                {priority && (
                    <div className="flex items-center gap-2">
                         <span className={`px-3 py-1 rounded text-sm font-medium text-white ${PriorityColors[priority?.metaValue!!] ?? "bg-slate-700"}`}>
                           {priority.metaValue?.toUpperCase() || "DEFAULT"}
                    </span>
                    </div>
                )}

            <h2
                className="draggable"
                style={{
                    flex: 1,
                    cursor: 'move',
                    margin: 0,
                    fontSize: '1.5em',
                    fontWeight: 'bold',
                    padding: 'var(--lumo-space-m) 0',
                }}
            >
            </h2>
            </>
        }
        >

            <div className="flex flex-col h-full w-full bg-stone-100 text-gray-100 rounded-lg overflow-hidden" style={{ maxHeight: '85vh', width: '100vw', maxWidth: '1400px' }}>
                {isLoading ? (
                    <div className="flex items-center justify-center p-10 text-gray-500">
                        <span className="animate-spin mr-2">🔄</span> Loading...
                    </div>
                ) : !task ? (
                    <div className="flex items-center justify-center p-10 text-gray-500">Task not found</div>
                ) : (
                    <div className="flex flex-col md:flex-row h-full overflow-hidden gap-4 p-6">
                        <div className="flex-1 overflow-y-auto space-y-6">
                            <div>
                                {isEditingTitle ? (
                                    <input
                                        type="text"
                                        value={editedTask?.postTitle || ''}
                                        onChange={(e) => setEditedTask((prev: Post | null) => prev ? { ...prev, postTitle: e.target.value } : null)}
                                        onBlur={() => handleSave()}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                                        className="w-full text-3xl font-bold text-gray-100 border-2 border-blue-500 rounded px-3 py-2 focus:outline-none bg-slate-700"
                                        autoFocus
                                    />
                                ) : (
                                    <h1
                                        className="text-3xl font-bold  cursor-pointer text-blue-400 transition-colors"
                                        onClick={() => setIsEditingTitle(true)}
                                    >
                                        {task.postTitle}
                                    </h1>
                                )}
                            </div>

                            <div className="flex gap-3 flex-wrap p-4 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-2 text-sm text-gray-400">
                                        DueDate: {dueDate}
                                    </div>

                                    <input
                                        type="date"
                                        value={dueDate}
                                        onChange={(e) => { setDueDate(e.target.value); updateTaskMetadata(); }}
                                        className="bg-slate-700 border border-gray-600 rounded px-2 py-1 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                    Created: {task.createdAt ? new Date(task.createdAt).toLocaleDateString() : 'N/A'}
                                </div>
                            </div>
                            <LabelTask postId={taskId} />

                            {taskData?.project?.id && (
                                <AssigneesTask postId={taskId} projectId={taskData?.project?.id}/>
                            )}


                            <DescriptionTask
                                task={task}
                                setEditedTask={setEditedTask}
                                handleSave={handleSave}
                                isEditingDesc={isEditingDesc}
                                setIsEditingDesc={setIsEditingDesc}
                            />
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-semibold text-gray-100">Checklist</h2>
                                    {checklistItems.length > 0 && (
                                        <div className="text-sm text-gray-400">{progress}% Complete</div>
                                    )}
                                </div>

                                {checklistItems.length > 0 && (
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                                            <div className="h-full bg-green-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
                                        </div>
                                        <button
                                            className="px-3 py-1 bg-red-600 text-gray-300 text-sm font-medium rounded hover:bg-red-700 transition-colors"
                                            onClick={async () => {
                                                for (const item of checklistItems) {
                                                    if (item.id) {
                                                        await ProjectService.deleteChecklistItem(item.id);
                                                    }
                                                }
                                                setChecklistItems([]);
                                                setProgress(0);
                                            }}
                                        >
                                            Clear All
                                        </button>
                                    </div>
                                )}

                                <div className="space-y-2 mb-4">
                                    {checklistItems.map((item, index) => {
                                        const content = item.postContent ? JSON.parse(item.postContent) : {};
                                        return (
                                            <div key={item.id || index} className="flex items-center gap-3 group hover:bg-slate-700 p-2 rounded transition-colors">
                                                <input
                                                    type="checkbox"
                                                    checked={content.completed || false}
                                                    onChange={() => toggleChecklistItem(index)}
                                                    className="w-4 h-4 text-blue-600 rounded border-gray-600 focus:ring-blue-500 cursor-pointer flex-shrink-0"
                                                />
                                                <input
                                                    value={item.postTitle || ''}
                                                    onChange={(e) => updateChecklistItemText(index, e.target.value)}
                                                    onBlur={() => saveChecklistItemText(index)}
                                                    className={`flex-1 bg-transparent border-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1 text-sm text-gray-100 ${
                                                        content.completed ? 'line-through text-gray-500' : ''
                                                    }`}
                                                />
                                                <button
                                                    onClick={() => deleteChecklistItem(index)}
                                                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-red-500 hover:bg-slate-700 rounded transition-all flex-shrink-0"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>

                                {isEditingChecklist ? (
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newChecklistText}
                                            onChange={(e) => setNewChecklistText(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') addChecklistItem();
                                                if (e.key === 'Escape') setIsEditingChecklist(false);
                                            }}
                                            placeholder="Add an item..."
                                            className="flex-1 bg-slate-700 border border-gray-700 rounded px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            autoFocus
                                        />
                                        <button
                                            onClick={addChecklistItem}
                                            className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                        >
                                            Add
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        className="px-3 py-1.5 bg-slate-700 text-gray-300 text-sm font-medium rounded hover:bg-slate-600 transition-colors flex items-center gap-2"
                                        onClick={() => setIsEditingChecklist(true)}
                                    >
                                        <Plus size={16} /> Add item
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="w-full md:w-96 bg-slate-700 border-l border-gray-700 p-6 rounded-lg overflow-y-auto flex flex-col">
                            <div className="mb-6 space-y-2">
                                <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3">Actions</h3>
                                <PriorityTask taskId={taskId} priority={priority!!}  loadDataPriority={loadDataPriority}/>
                            </div>
                            <CommentTask id={taskId}/>
                            <div className="border-t border-gray-700 my-4"></div>
                        </div>
                    </div>
                )}
            </div>
        </Dialog>
    );
}