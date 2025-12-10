import { Select } from '@vaadin/react-components';
import { Dialog } from '@vaadin/react-components/Dialog';
import { Breadcrumb, Crumb } from 'Frontend/components/Breadcrumb';
import AssigneesTask from 'Frontend/components/project/AssigneesTask';
import CheckListTask from 'Frontend/components/project/CheckListTask';
import CommentTask from 'Frontend/components/project/CommentTask';
import DescriptionTask from 'Frontend/components/project/DescriptionTask';
import { PriorityColors } from 'Frontend/components/project/dto/projectDto';
import LabelTask from 'Frontend/components/project/LabelTask';
import PriorityTask from 'Frontend/components/project/PriorityTask';
import Post from 'Frontend/generated/com/adudu/ashpalt/models/project/Post';
import PostMeta from 'Frontend/generated/com/adudu/ashpalt/models/project/PostMeta';
import Project from 'Frontend/generated/com/adudu/ashpalt/models/project/Project';
import { ProjectService } from 'Frontend/generated/endpoints';
import { useEffect, useState } from 'react';

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
  projectId: string;
}

interface ItemColumnProps {
  label: string;
  value: string;
  disabled: boolean;
}

interface UpdatePostContentProps {
  key: 'description' | 'labels' | 'dueDate' | 'priority' | 'assignees' | 'customFields';
  value: any;
}

export default function TaskDetailModal({
  taskId,
  isOpen,
  onClose,
  columns,
  projectId,
}: TaskDetailModalProps) {
  const [taskData, setTaskData] = useState<TaskWithContext | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [editedTask, setEditedTask] = useState<Post | null>(null);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [dueDate, setDueDate] = useState<string>('');
  const [priority, setPriority] = useState<PostMeta | null>(null);
  const [itemColumnList, setItemColumnList] = useState<ItemColumnProps[]>([]);
  const [itemCrumb, setItemCrumb] = useState<Crumb[]>([]);

  useEffect(() => {
    if (taskId && isOpen) {
      loadTask(taskId);
      const mapped: ItemColumnProps[] = columns.map((e: any) => ({
        label: e.postTitle,
        value: e.id,
        disabled: false,
      }));
      setItemColumnList(mapped);
    }
  }, [taskId, isOpen]);

  async function loadTask(id: string) {
    try {
      setIsLoading(true);
      const data = await ProjectService.getTaskWithContext(id);
      setTaskData(data || null);
      setEditedTask(data?.task ?? null);
      setItemCrumb((prev) => [
        ...[
          { label: 'Dashboard', href: '/' },
          { label: 'Projects', href: `/project/${projectId}` },
        ],
        {
          label: data?.task?.postTitle || '',
          href: `/project/${projectId}?current=${data?.task?.id}`,
        },
      ]);

      if (data?.task) {
        if (data.task.postContent && data.task.postContentType === 'json') {
          try {
            const content = JSON.parse(data.task.postContent);
            setDueDate(content.dueDate || '');
            setCustomFields(content.customFields || []);
          } catch (e) {
            console.error('Error parsing content', e);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load task', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSave(taskToSave: Post | null = editedTask) {
    if (!taskToSave) return;

    try {
      const savedTask = await ProjectService.updateTask(taskToSave);
      if (savedTask) {
        setEditedTask(savedTask);
        setTaskData((prev) => (prev ? { ...prev, task: savedTask } : null));
      }
      setIsEditingTitle(false);
      setIsEditingDesc(false);
    } catch (error) {
      console.error('Failed to save task', error);
    }
  }

  const updateTaskMetadata = async (props?: UpdatePostContentProps) => {
    if (!editedTask) return;

    const content =
      editedTask.postContentType === 'json' && editedTask.postContent
        ? JSON.parse(editedTask.postContent)
        : {};
    let updatedContent = {
      description: content.description || '',
      dueDate,
      priority,
      customFields,
      ...content,
    };

    if (props) {
      switch (props.key) {
        case 'dueDate':
          updatedContent = {
            ...updatedContent,
            dueDate: props.value,
          };
          break;

        case 'description':
          updatedContent = {
            ...updatedContent,
            description: props.value,
          };
          break;

        case 'customFields':
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
      postContentType: 'json',
    };

    setEditedTask(updatedTask);
    await handleSave(updatedTask);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !editedTask || !taskId) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Int8Array(arrayBuffer);
      const byteArray = Array.from(bytes);

      const path = await ProjectService.uploadFile(byteArray, file.name);
      await loadTask(taskId);
    } catch (error) {
      console.error('Failed to upload file', error);
      alert('Failed to upload file');
    }
  };

  if (!isOpen || !taskId) return null;

  const task = editedTask || taskData?.task;

  return (
    <Dialog
      opened={isOpen}
      onOpenedChanged={(e) => !e.detail.value && onClose()}
      headerTitle={task?.postTitle || 'Task Details'}
      header={
        <>
          <Select
            className="bg-emerald-500 rounded-lg bold antialiased"
            items={itemColumnList}
            value={taskData?.column?.id || ''}
            onChange={async (e) => {
              setEditedTask((prevState) => ({
                ...prevState,
                postParent: e.target.value,
              }));
              await ProjectService.moveTask(editedTask?.id, e.target.value!, editedTask?.postOrder);
            }}
          />
          {priority && (
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded text-sm font-medium text-white ${PriorityColors[priority?.metaValue!!] ?? 'bg-slate-700'}`}
              >
                {priority.metaValue?.toUpperCase() || 'DEFAULT'}
              </span>
            </div>
          )}
        </>
      }
    >
      <div
        className="flex flex-col h-full w-full bg-stone-100 text-gray-100 rounded-lg overflow-hidden"
        style={{ maxHeight: '85vh', width: '100vw', maxWidth: '1400px' }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center p-10 text-gray-500">
            <span className="animate-spin mr-2">🔄</span> Loading...
          </div>
        ) : !task ? (
          <div className="flex items-center justify-center p-10 text-gray-500">Task not found</div>
        ) : (
          <div className="flex flex-col md:flex-row h-full overflow-hidden gap-4 p-6">
            <div className="flex-1 overflow-y-auto space-y-6">
              <Breadcrumb items={itemCrumb} />
              <div>
                {isEditingTitle ? (
                  <input
                    type="text"
                    value={editedTask?.postTitle || ''}
                    onChange={(e) =>
                      setEditedTask((prev: Post | null) =>
                        prev ? { ...prev, postTitle: e.target.value } : null
                      )
                    }
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
                    onChange={(e) => {
                      setDueDate(e.target.value);
                      updateTaskMetadata();
                    }}
                    className="bg-slate-700 border border-gray-600 rounded px-2 py-1 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  Created: {task.createdAt ? new Date(task.createdAt).toLocaleDateString() : 'N/A'}
                </div>
              </div>
              <LabelTask postId={taskId} />

              {taskData?.project?.id && (
                <AssigneesTask postId={taskId} projectId={taskData?.project?.id} />
              )}

              <DescriptionTask
                task={task}
                setEditedTask={setEditedTask}
                handleSave={handleSave}
                isEditingDesc={isEditingDesc}
                setIsEditingDesc={setIsEditingDesc}
              />
              <CheckListTask taskId={taskId} />
            </div>

            <div className="w-full md:w-96 p-6 rounded-lg overflow-y-auto flex flex-col bg-slate-700">
              <div className="mb-6 space-y-2">
                <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3">Actions</h3>
                <PriorityTask taskId={taskId} priority={priority!!} setPriority={setPriority!!} />
              </div>
              <CommentTask id={taskId} />
              <div className="border-t border-gray-700 my-4"></div>
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
}
