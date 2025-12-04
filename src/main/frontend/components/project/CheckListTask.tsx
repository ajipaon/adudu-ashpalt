import MetaType from 'Frontend/generated/com/adudu/ashpalt/models/project/MetaType';
import PostMeta from 'Frontend/generated/com/adudu/ashpalt/models/project/PostMeta';
import { PostMetaService } from 'Frontend/generated/endpoints';
import { Plus, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

const mKey = 'checklist';
const metaType: MetaType = MetaType.JSON;

interface MetavalueCheckListProps {
  title: string;
  status: 'COMPLETE' | 'PROGRESS';
}

interface CheckListTaskProps {
  taskId: string;
}

export default function CheckListTask({ taskId }: CheckListTaskProps) {
  const [isCreateChecklist, setIsCreateChecklist] = useState(false);
  const [progress, setProgress] = useState(0);
  const [checklistItems, setChecklistItems] = useState<PostMeta[] | []>([]);
  const [newCheckListItem, setNewCheckListItem] = useState<MetavalueCheckListProps>({
    title: '',
    status: 'PROGRESS',
  });

  const calculateProgress = () => {
    if (checklistItems.length === 0) {
      setProgress(0);
      return;
    }
    const completed = checklistItems.filter((i) => {
      try {
        const content: MetavalueCheckListProps = i.metaValue ? JSON.parse(i.metaValue) : {};
        return content.status === 'COMPLETE';
      } catch {
        return false;
      }
    }).length;
    setProgress(Math.round((completed / checklistItems.length) * 100));
  };

  const loadDataCheckList = useCallback(() => {
    PostMetaService.getMeta(taskId!!, mKey)
      .then((value) => {
        const filtered = (value ?? []).filter((v): v is PostMeta => !!v);
        setChecklistItems(filtered || []);
        calculateProgress();
      })
      .catch((error) => {
        console.error('Failed to load assignees:', error);
        setChecklistItems([]);
      });
  }, [taskId]);

  useEffect(() => {
    loadDataCheckList();
  }, []);

  const toggleChecklistItem = (index: number) => {
    const updatedList = [...checklistItems];
    try {
      const parsed: MetavalueCheckListProps = JSON.parse(updatedList[index].metaValue!!);

      parsed.status = parsed.status == 'COMPLETE' ? 'PROGRESS' : 'COMPLETE';
      updatedList[index].metaValue = JSON.stringify(parsed);
    } catch (err: any) {
      console.error(err.message);
    }
    const postMetaCurrent = updatedList[index];
    PostMetaService.saveMeta(postMetaCurrent).then((e) => {
      setChecklistItems(updatedList);
      calculateProgress();
    });
  };

  const updateChecklistItemText = (index: number, value: string) => {
    const updatedList = [...checklistItems];
    try {
      const parsed: MetavalueCheckListProps = JSON.parse(updatedList[index].metaValue!!);

      parsed.title = value;
      updatedList[index].metaValue = JSON.stringify(parsed);
    } catch (err: any) {
      console.error(err.message);
    }
    setChecklistItems(updatedList);
  };

  const addChecklistItem = async () => {
    try {
      const newMeta: PostMeta = {
        metaKey: mKey,
        metaType,
        metaValue: JSON.stringify(newCheckListItem),
        postId: taskId,
      };
      await PostMetaService.saveMeta(newMeta);
      setNewCheckListItem({
        title: '',
        status: 'PROGRESS',
      });
      loadDataCheckList();
    } catch (error) {
      console.error('Failed to add Priority:', error);
    }
  };

  const saveChecklistItemText = async (index: number) => {
    const updatedList = [...checklistItems];
    const postMetaCurrent = updatedList[index];

    await PostMetaService.saveMeta(postMetaCurrent);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-800">Checklist</h2>
        {checklistItems.length > 0 && (
          <div className="text-sm text-slate-800">{progress}% Complete</div>
        )}
      </div>

      {checklistItems.length > 0 && (
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <button
            className="px-3 py-1 bg-red-600 text-gray-300 text-sm font-medium rounded hover:bg-red-700 transition-colors"
            onClick={async () => {
              for (const item of checklistItems) {
                if (item.id) {
                  await PostMetaService.deleteMeta(item.id);
                  setChecklistItems([]);
                }
              }
              setProgress(0);
            }}
          >
            Clear All
          </button>
        </div>
      )}

      <div className="space-y-2 mb-4">
        {checklistItems.map((item: PostMeta, index) => {
          const content: MetavalueCheckListProps = item.metaValue ? JSON.parse(item.metaValue) : {};
          return (
            <div
              key={item.id || index}
              className="flex items-center gap-3 group hover:bg-slate-700 bg-slate-600 p-2 rounded transition-colors"
            >
              <input
                type="checkbox"
                checked={content.status == 'COMPLETE' || false}
                onChange={() => toggleChecklistItem(index)}
                className="w-4 h-4 text-blue-600 rounded border-gray-600 focus:ring-blue-500 cursor-pointer flex-shrink-0"
              />
              <input
                value={content.title || ''}
                onChange={(e) => updateChecklistItemText(index, e.target.value)}
                onBlur={() => saveChecklistItemText(index)}
                className={`flex-1 bg-transparent border-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1 text-sm text-gray-100 ${
                  content.status == 'COMPLETE' ? 'line-through text-gray-500' : ''
                }`}
              />
              <button
                onClick={() => {
                  PostMetaService.deleteMeta(item.id).then(() => {
                    loadDataCheckList();
                  });
                }}
                className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-red-500 hover:bg-slate-700 rounded transition-all flex-shrink-0"
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>

      {isCreateChecklist ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={newCheckListItem.title}
            onChange={(e) => {
              setNewCheckListItem((prev) => ({
                ...prev,
                title: e.target.value,
              }));
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') addChecklistItem();
              if (e.key === 'Escape') setIsCreateChecklist(false);
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
          onClick={() => setIsCreateChecklist(true)}
        >
          <Plus size={16} /> Add item
        </button>
      )}
    </div>
  );
}
