import Placeholder from '@tiptap/extension-placeholder';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { ProjectService } from 'Frontend/generated/endpoints';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  MessageCircle,
  Quote,
  Redo,
  Send,
  Strikethrough,
  Undo,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface CommentTask {
  id?: string;
  postId?: string;
  text?: string;
  createdAt?: string;
  author?: string;
}

interface CommentTaskProps {
  id: string;
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b border-gray-600 bg-gray-800 rounded-t-lg">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`p-1.5 rounded hover:bg-gray-700 transition-colors ${editor.isActive('bold') ? 'bg-gray-700 text-blue-400' : 'text-gray-400'}`}
        title="Bold"
      >
        <Bold size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`p-1.5 rounded hover:bg-gray-700 transition-colors ${editor.isActive('italic') ? 'bg-gray-700 text-blue-400' : 'text-gray-400'}`}
        title="Italic"
      >
        <Italic size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={`p-1.5 rounded hover:bg-gray-700 transition-colors ${editor.isActive('strike') ? 'bg-gray-700 text-blue-400' : 'text-gray-400'}`}
        title="Strike"
      >
        <Strikethrough size={16} />
      </button>
      <div className="w-px h-6 bg-gray-600 mx-1 self-center" />
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-1.5 rounded hover:bg-gray-700 transition-colors ${editor.isActive('bulletList') ? 'bg-gray-700 text-blue-400' : 'text-gray-400'}`}
        title="Bullet List"
      >
        <List size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-1.5 rounded hover:bg-gray-700 transition-colors ${editor.isActive('orderedList') ? 'bg-gray-700 text-blue-400' : 'text-gray-400'}`}
        title="Ordered List"
      >
        <ListOrdered size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`p-1.5 rounded hover:bg-gray-700 transition-colors ${editor.isActive('blockquote') ? 'bg-gray-700 text-blue-400' : 'text-gray-400'}`}
        title="Blockquote"
      >
        <Quote size={16} />
      </button>
      <div className="w-px h-6 bg-gray-600 mx-1 self-center" />
      <button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
        className="p-1.5 rounded hover:bg-gray-700 text-gray-400 disabled:opacity-50 transition-colors"
        title="Undo"
      >
        <Undo size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        className="p-1.5 rounded hover:bg-gray-700 text-gray-400 disabled:opacity-50 transition-colors"
        title="Redo"
      >
        <Redo size={16} />
      </button>
    </div>
  );
};

export default function CommentTask({ id }: CommentTaskProps) {
  const [comments, setComments] = useState<CommentTask[]>([]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Write a comment...',
        emptyEditorClass:
          'is-editor-empty before:content-[attr(data-placeholder)] before:text-gray-500 before:float-left before:pointer-events-none before:h-0',
      }),
    ],
    editorProps: {
      attributes: {
        class:
          'prose prose-invert max-w-none focus:outline-none min-h-[80px] px-3 py-2 text-sm text-gray-100',
      },
    },
  });

  useEffect(() => {
    if (id) {
      loadComment().then(() => {
        console.log('comment loaded');
      });
    }
  }, [id]);

  const addComment = async () => {
    if (!editor || editor.isEmpty) return;

    const newComment: CommentTask = {
      postId: id!!,
      text: editor.getHTML(),
      createdAt: new Date().toISOString(),
    };
    try {
      const savedComment = await ProjectService.saveComment(newComment);
      if (savedComment) {
        setComments((prev) => [...prev, savedComment]);
        editor.commands.clearContent();
      }
    } catch (error) {
      console.error('Failed to add comment', error);
    }
  };

  const loadComment = async () => {
    const taskComments = await ProjectService.getCommentsByTaskId(id!!);
    setComments(
      (taskComments || []).filter((comment): comment is CommentTask => comment !== undefined)
    );
  };
  return (
    <>
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle size={20} className="text-gray-300" />
        <h2 className="text-lg font-semibold text-gray-100">Comments</h2>
      </div>

      <div className="space-y-4 mb-6 flex-1 overflow-y-auto">
        {comments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">No comments yet</p>
          </div>
        ) : (
          comments.map((comment, idx) => (
            <div key={comment.id || idx} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {(comment.author || 'U')[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-sm font-semibold text-gray-100">
                    {comment.author || 'User'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {comment.createdAt ? new Date(comment.createdAt).toLocaleString() : ''}
                  </span>
                </div>
                <div
                  className="bg-gray-700 border border-gray-600 rounded-lg p-3 text-sm text-gray-300 break-words prose prose-invert max-w-none [&>p]:m-0"
                  dangerouslySetInnerHTML={{ __html: comment.text || '' }}
                />
              </div>
            </div>
          ))
        )}
      </div>

      <div className="bg-gray-700 border border-gray-600 rounded-lg overflow-hidden flex flex-col">
        <MenuBar editor={editor} />
        <EditorContent editor={editor} />
        <div className="bg-gray-800 px-3 py-2 flex justify-end border-t border-gray-600 gap-2">
          <button
            className={`px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors flex items-center gap-2`}
            onClick={addComment}
          >
            <Send size={16} /> Send
          </button>
        </div>
      </div>
    </>
  );
}
