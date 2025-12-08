import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
    Bold,
    Italic,
    Strikethrough,
    Code,
    List,
    ListOrdered,
    Quote,
    Undo,
    Redo,
    Link as LinkIcon,
    Image as ImageIcon,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    Highlighter,
    Type,
    Heading1,
    Heading2,
    Heading3,
} from 'lucide-react';
import { useCallback } from 'react';

interface RichTextEditorProps {
    content: string;
    onChange: (html: string) => void;
    placeholder?: string;
    editable?: boolean;
}

const RichTextEditor = ({
    content,
    onChange,
    placeholder = 'Write something amazing...',
    editable = true,
}: RichTextEditorProps) => {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder,
                emptyEditorClass: 'is-editor-empty before:content-[attr(data-placeholder)] before:text-gray-400 before:float-left before:pointer-events-none before:h-0',
            }),
            Underline,
            Link.configure({
                openOnClick: false,
            }),
            Image,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            TextStyle,
            Color,
            Highlight.configure({ multicolor: true }),
        ],
        content,
        editable,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-lg max-w-none focus:outline-none min-h-[300px] px-4 py-2',
            },
        },
    });

    const setLink = useCallback(() => {
        if (!editor) return;
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL', previousUrl);

        // cancelled
        if (url === null) return;

        // empty
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }

        // update
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }, [editor]);

    const addImage = useCallback(() => {
        if (!editor) return;
        const url = window.prompt('URL');

        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    }, [editor]);

    if (!editor) {
        return null;
    }

    return (
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
            {/* Toolbar */}
            {editable && (
                <div className="flex flex-wrap gap-1 p-2 border-b border-gray-200 bg-gray-50 sticky top-0 z-10">
                    <div className="flex items-center gap-1 pr-2 border-r border-gray-300">
                        <button
                            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                            className={`p-1.5 rounded hover:bg-gray-200 ${editor.isActive('heading', { level: 1 }) ? 'bg-gray-200 text-indigo-600' : 'text-gray-600'}`}
                            title="Heading 1"
                        >
                            <Heading1 size={18} />
                        </button>
                        <button
                            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                            className={`p-1.5 rounded hover:bg-gray-200 ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-200 text-indigo-600' : 'text-gray-600'}`}
                            title="Heading 2"
                        >
                            <Heading2 size={18} />
                        </button>
                        <button
                            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                            className={`p-1.5 rounded hover:bg-gray-200 ${editor.isActive('heading', { level: 3 }) ? 'bg-gray-200 text-indigo-600' : 'text-gray-600'}`}
                            title="Heading 3"
                        >
                            <Heading3 size={18} />
                        </button>
                    </div>

                    <div className="flex items-center gap-1 px-2 border-r border-gray-300">
                        <button
                            onClick={() => editor.chain().focus().toggleBold().run()}
                            disabled={!editor.can().chain().focus().toggleBold().run()}
                            className={`p-1.5 rounded hover:bg-gray-200 ${editor.isActive('bold') ? 'bg-gray-200 text-indigo-600' : 'text-gray-600'}`}
                            title="Bold"
                        >
                            <Bold size={18} />
                        </button>
                        <button
                            onClick={() => editor.chain().focus().toggleItalic().run()}
                            disabled={!editor.can().chain().focus().toggleItalic().run()}
                            className={`p-1.5 rounded hover:bg-gray-200 ${editor.isActive('italic') ? 'bg-gray-200 text-indigo-600' : 'text-gray-600'}`}
                            title="Italic"
                        >
                            <Italic size={18} />
                        </button>
                        <button
                            onClick={() => editor.chain().focus().toggleUnderline().run()}
                            className={`p-1.5 rounded hover:bg-gray-200 ${editor.isActive('underline') ? 'bg-gray-200 text-indigo-600' : 'text-gray-600'}`}
                            title="Underline"
                        >
                            <Type size={18} />
                        </button>
                        <button
                            onClick={() => editor.chain().focus().toggleStrike().run()}
                            disabled={!editor.can().chain().focus().toggleStrike().run()}
                            className={`p-1.5 rounded hover:bg-gray-200 ${editor.isActive('strike') ? 'bg-gray-200 text-indigo-600' : 'text-gray-600'}`}
                            title="Strikethrough"
                        >
                            <Strikethrough size={18} />
                        </button>
                        <button
                            onClick={() => editor.chain().focus().toggleCode().run()}
                            disabled={!editor.can().chain().focus().toggleCode().run()}
                            className={`p-1.5 rounded hover:bg-gray-200 ${editor.isActive('code') ? 'bg-gray-200 text-indigo-600' : 'text-gray-600'}`}
                            title="Code"
                        >
                            <Code size={18} />
                        </button>
                        <button
                            onClick={() => editor.chain().focus().toggleHighlight().run()}
                            className={`p-1.5 rounded hover:bg-gray-200 ${editor.isActive('highlight') ? 'bg-gray-200 text-indigo-600' : 'text-gray-600'}`}
                            title="Highlight"
                        >
                            <Highlighter size={18} />
                        </button>
                    </div>

                    <div className="flex items-center gap-1 px-2 border-r border-gray-300">
                        <button
                            onClick={() => editor.chain().focus().setTextAlign('left').run()}
                            className={`p-1.5 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'left' }) ? 'bg-gray-200 text-indigo-600' : 'text-gray-600'}`}
                            title="Align Left"
                        >
                            <AlignLeft size={18} />
                        </button>
                        <button
                            onClick={() => editor.chain().focus().setTextAlign('center').run()}
                            className={`p-1.5 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'center' }) ? 'bg-gray-200 text-indigo-600' : 'text-gray-600'}`}
                            title="Align Center"
                        >
                            <AlignCenter size={18} />
                        </button>
                        <button
                            onClick={() => editor.chain().focus().setTextAlign('right').run()}
                            className={`p-1.5 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'right' }) ? 'bg-gray-200 text-indigo-600' : 'text-gray-600'}`}
                            title="Align Right"
                        >
                            <AlignRight size={18} />
                        </button>
                        <button
                            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                            className={`p-1.5 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'justify' }) ? 'bg-gray-200 text-indigo-600' : 'text-gray-600'}`}
                            title="Justify"
                        >
                            <AlignJustify size={18} />
                        </button>
                    </div>

                    <div className="flex items-center gap-1 px-2 border-r border-gray-300">
                        <button
                            onClick={() => editor.chain().focus().toggleBulletList().run()}
                            className={`p-1.5 rounded hover:bg-gray-200 ${editor.isActive('bulletList') ? 'bg-gray-200 text-indigo-600' : 'text-gray-600'}`}
                            title="Bullet List"
                        >
                            <List size={18} />
                        </button>
                        <button
                            onClick={() => editor.chain().focus().toggleOrderedList().run()}
                            className={`p-1.5 rounded hover:bg-gray-200 ${editor.isActive('orderedList') ? 'bg-gray-200 text-indigo-600' : 'text-gray-600'}`}
                            title="Ordered List"
                        >
                            <ListOrdered size={18} />
                        </button>
                        <button
                            onClick={() => editor.chain().focus().toggleBlockquote().run()}
                            className={`p-1.5 rounded hover:bg-gray-200 ${editor.isActive('blockquote') ? 'bg-gray-200 text-indigo-600' : 'text-gray-600'}`}
                            title="Blockquote"
                        >
                            <Quote size={18} />
                        </button>
                    </div>

                    <div className="flex items-center gap-1 pl-2">
                        <button
                            onClick={setLink}
                            className={`p-1.5 rounded hover:bg-gray-200 ${editor.isActive('link') ? 'bg-gray-200 text-indigo-600' : 'text-gray-600'}`}
                            title="Link"
                        >
                            <LinkIcon size={18} />
                        </button>
                        <button
                            onClick={addImage}
                            className="p-1.5 rounded hover:bg-gray-200 text-gray-600"
                            title="Image"
                        >
                            <ImageIcon size={18} />
                        </button>
                        <div className="w-px h-6 bg-gray-300 mx-1" />
                        <button
                            onClick={() => editor.chain().focus().undo().run()}
                            disabled={!editor.can().chain().focus().undo().run()}
                            className="p-1.5 rounded hover:bg-gray-200 text-gray-600 disabled:opacity-50"
                            title="Undo"
                        >
                            <Undo size={18} />
                        </button>
                        <button
                            onClick={() => editor.chain().focus().redo().run()}
                            disabled={!editor.can().chain().focus().redo().run()}
                            className="p-1.5 rounded hover:bg-gray-200 text-gray-600 disabled:opacity-50"
                            title="Redo"
                        >
                            <Redo size={18} />
                        </button>
                    </div>
                </div>
            )}

            {/* Editor Content */}
            <EditorContent editor={editor} />
        </div>
    );
};

export default RichTextEditor;
