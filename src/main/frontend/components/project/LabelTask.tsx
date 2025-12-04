import MetaType from 'Frontend/generated/com/adudu/ashpalt/models/project/MetaType';
import PostMeta from 'Frontend/generated/com/adudu/ashpalt/models/project/PostMeta';
import { PostMetaService } from 'Frontend/generated/endpoints';
import { Plus, Tag, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

const mKey = 'label';
const metaType: MetaType = MetaType.TEXT;

interface labelTaskProps {
  postId: string;
}

export default function LabelTask({ postId }: labelTaskProps) {
  const [newLabel, setNewLabel] = useState<string>('');
  const [labels, setLabels] = useState<PostMeta[]>([]);

  const loadData = useCallback(() => {
    PostMetaService.getMeta(postId, mKey)
      .then((value) => {
        const filteredAssignees = (value || []).filter(
          (assignee): assignee is PostMeta => assignee !== undefined
        );
        setLabels(filteredAssignees);
      })
      .catch((error) => {
        console.error('Failed to load assignees:', error);
        setLabels([]);
      });
  }, [postId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const removeLabel = (label: PostMeta) => {
    PostMetaService.deleteMeta(label.id).then(() => {
      loadData();
    });
  };

  const addLabel = () => {
    try {
      const label: PostMeta = {
        postId,
        metaKey: mKey,
        metaType,
        metaValue: newLabel,
      };

      PostMetaService.saveMeta(label).then(() => {
        setNewLabel('');
        loadData();
      });
    } catch (e: any) {
      console.error(e.message);
    }
  };

  return (
    <>
      <div className="flex flex-wrap mb-1">
        <label className="flex text-sm font-semibold text-gray-400 items-center">
          <Tag size={16} /> Labels
        </label>
        {labels.map((label, idx) => (
          <span
            key={idx}
            className="px-3 py-1 mx-1 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 transition-colors flex items-center gap-2 group cursor-pointer"
          >
            {label?.metaValue || 'N/A'}
            <X
              size={14}
              onClick={() => removeLabel(label)}
              className="opacity-0 group-hover:opacity-100"
            />
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
        <button
          onClick={addLabel}
          className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
        </button>
      </div>
    </>
  );
}
