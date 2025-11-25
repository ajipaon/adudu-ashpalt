import {
    Zap,
    Heading1,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    CheckSquare,
    Code,
    Quote,
    Image as ImageIcon,
    MoreHorizontal,
    Bold,
    Italic,
    Underline as UnderlineIcon,
    Strikethrough,
    Link as LinkIcon
} from "lucide-react";
import { useEditor, EditorContent, Editor, Range } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import Post from "Frontend/generated/com/adudu/ashpalt/models/project/Post";

interface DescriptionTaskProps {
    isEditingDesc: boolean;
    task: Post;
    setEditedTask: (task: Partial<Post>) => void;
    handleSave: () => void;
    setIsEditingDesc: (val: boolean) => void;
    autoFocus?: boolean;
}

interface CommandItemProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    command: (editor: Editor, range: Range) => void;
}

interface NotionBubbleMenuProps {
    editor: Editor | null;
}

const NotionBubbleMenu = ({ editor }: NotionBubbleMenuProps) => {
    if (!editor) return null;

    const handleAddLink = useCallback(() => {
        const currentHref = editor.getAttributes('link').href;
        const url = prompt("Enter link URL:", currentHref || "https://");

        if (url === null) return;

        if (url === "") {
            editor.chain().focus().unsetLink().run();
        } else {
            editor.chain().focus().setLink({ href: url }).run();
        }
    }, [editor]);

    const menuItems = [
        {
            key: "bold",
            label: <Bold size={14} />,
            title: "Bold (⌘B)",
            action: () => editor.chain().focus().toggleBold().run(),
            isActive: editor.isActive("bold"),
        },
        {
            key: "italic",
            label: <Italic size={14} />,
            title: "Italic (⌘I)",
            action: () => editor.chain().focus().toggleItalic().run(),
            isActive: editor.isActive("italic"),
        },
        {
            key: "underline",
            label: <UnderlineIcon size={14} />,
            title: "Underline (⌘U)",
            action: () => editor.chain().focus().toggleUnderline().run(),
            isActive: editor.isActive("underline"),
        },
        {
            key: "strike",
            label: <Strikethrough size={14} />,
            title: "Strikethrough (⌘Shift+S)",
            action: () => editor.chain().focus().toggleStrike().run(),
            isActive: editor.isActive("strike"),
        },
        {
            key: "code",
            label: <Code size={14} />,
            title: "Code",
            action: () => editor.chain().focus().toggleCode().run(),
            isActive: editor.isActive("code"),
        },
        {
            key: "link",
            label: <LinkIcon size={14} />,
            title: "Link (⌘K)",
            action: handleAddLink,
            isActive: editor.isActive("link"),
        }
    ];

    return (
        <BubbleMenu
            editor={editor}
            className="flex items-center gap-0.5 p-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl"
        >
            {menuItems.map((item) => (
                <button
                    key={item.key}
                    onClick={item.action}
                    className={`flex items-center justify-center w-7 h-7 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${item.isActive
                        ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                        : "text-gray-600 dark:text-gray-300"
                        }`}
                    title={item.title}
                    type="button"
                >
                    {item.label}
                </button>
            ))}
        </BubbleMenu>
    );
};

interface SlashCommandMenuProps {
    items: CommandItemProps[];
    selectedIndex: number;
    selectItem: (index: number) => void;
    position: { x: number; y: number } | null;
}

const SlashCommandMenu = ({ items, selectedIndex, selectItem, position }: SlashCommandMenuProps) => {
    if (!position) return null;

    return (
        <div
            className="fixed z-50 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col max-h-[330px] overflow-y-auto"
            style={{
                top: position.y,
                left: position.x,
            }}
        >
            <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700/50">
                Basic Blocks
            </div>
            <div className="p-1">
                {items.length > 0 ? (
                    items.map((item, index) => (
                        <button
                            key={index}
                            className={`flex items-center gap-3 w-full px-2 py-1.5 text-left rounded-md transition-colors ${index === selectedIndex
                                ? "bg-blue-50 dark:bg-blue-900/20 text-gray-900 dark:text-gray-100"
                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                }`}
                            onClick={() => selectItem(index)}
                        >
                            <div className="flex items-center justify-center w-10 h-10 rounded border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 shadow-sm">
                                {item.icon}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-medium">{item.title}</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{item.description}</span>
                            </div>
                        </button>
                    ))
                ) : (
                    <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                        No results
                    </div>
                )}
            </div>
        </div>
    );
};

export default function DescriptionTask({
    isEditingDesc,
    task,
    setEditedTask,
    handleSave,
    setIsEditingDesc,
    autoFocus = false
}: DescriptionTaskProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [hasChanges, setHasChanges] = useState(false);

    const [slashMenuOpen, setSlashMenuOpen] = useState(false);
    const [slashMenuPosition, setSlashMenuPosition] = useState<{ x: number; y: number } | null>(null);
    const [slashMenuFilter, setSlashMenuFilter] = useState("");
    const [slashMenuIndex, setSlashMenuIndex] = useState(0);
    const [slashCommandRange, setSlashCommandRange] = useState<Range | null>(null);

    const safeJsonParse = useCallback((str: string): any => {
        try {
            return JSON.parse(str);
        } catch {
            return {};
        }
    }, []);

    const extractDescription = useCallback((task: Post | null): string => {
        if (!task?.postContent) return "";

        try {
            if (task.postContentType === "json") {
                const content = safeJsonParse(task.postContent);
                return content.description || "";
            }
            return task.postContent;
        } catch {
            return task.postContent || "";
        }
    }, [safeJsonParse]);

    const initialContent = useMemo(() =>
        extractDescription(task),
        [task, extractDescription]
    );

    const commandItems: CommandItemProps[] = useMemo(() => [
        {
            title: "Text",
            description: "Just start writing with plain text.",
            icon: <span className="text-lg font-serif">T</span>,
            command: (editor, range) => {
                editor.chain().focus().deleteRange(range).setParagraph().run();
            },
        },
        {
            title: "Heading 1",
            description: "Big section heading.",
            icon: <Heading1 size={18} />,
            command: (editor, range) => {
                editor.chain().focus().deleteRange(range).setNode("heading", { level: 1 }).run();
            },
        },
        {
            title: "Heading 2",
            description: "Medium section heading.",
            icon: <Heading2 size={18} />,
            command: (editor, range) => {
                editor.chain().focus().deleteRange(range).setNode("heading", { level: 2 }).run();
            },
        },
        {
            title: "Heading 3",
            description: "Small section heading.",
            icon: <Heading3 size={18} />,
            command: (editor, range) => {
                editor.chain().focus().deleteRange(range).setNode("heading", { level: 3 }).run();
            },
        },
        {
            title: "Bullet List",
            description: "Create a simple bulleted list.",
            icon: <List size={18} />,
            command: (editor, range) => {
                editor.chain().focus().deleteRange(range).toggleBulletList().run();
            },
        },
        {
            title: "Numbered List",
            description: "Create a list with numbering.",
            icon: <ListOrdered size={18} />,
            command: (editor, range) => {
                editor.chain().focus().deleteRange(range).toggleOrderedList().run();
            },
        },
        {
            title: "Quote",
            description: "Capture a quote.",
            icon: <Quote size={18} />,
            command: (editor, range) => {
                editor.chain().focus().deleteRange(range).setBlockquote().run();
            },
        },
        {
            title: "Code Block",
            description: "Capture a code snippet.",
            icon: <Code size={18} />,
            command: (editor, range) => {
                editor.chain().focus().deleteRange(range).setCodeBlock().run();
            },
        },
        {
            title: "Divider",
            description: "Visually divide blocks.",
            icon: <MoreHorizontal size={18} />,
            command: (editor, range) => {
                editor.chain().focus().deleteRange(range).setHorizontalRule().run();
            },
        }
    ], []);

    const filteredCommands = useMemo(() => {
        return commandItems.filter(item =>
            item.title.toLowerCase().includes(slashMenuFilter.toLowerCase()) ||
            item.description.toLowerCase().includes(slashMenuFilter.toLowerCase())
        );
    }, [commandItems, slashMenuFilter]);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3] },
                codeBlock: { HTMLAttributes: { class: 'code-block' } },
                bulletList: { HTMLAttributes: { class: 'list-disc ml-4' } },
                orderedList: { HTMLAttributes: { class: 'list-decimal ml-4' } },
                blockquote: { HTMLAttributes: { class: 'border-l-4 border-gray-300 pl-4 italic my-4' } },
                horizontalRule: { HTMLAttributes: { class: 'my-4 border-t border-gray-200' } },
            }),
            Link.configure({
                openOnClick: false,
                autolink: true,
                HTMLAttributes: {
                    class: 'text-blue-600 dark:text-blue-400 hover:underline cursor-pointer'
                }
            }),
            Image.configure({
                HTMLAttributes: {
                    class: 'rounded-lg max-w-full h-auto my-4'
                }
            }),
            Color,
            TextStyle,
            Underline,
            Highlight.configure({
                multicolor: true,
                HTMLAttributes: {
                    class: 'px-1 rounded bg-yellow-100 dark:bg-yellow-900/30'
                }
            }),
            Placeholder.configure({
                placeholder: ({ node }) => {
                    if (node.type.name === 'heading') {
                        return `Heading ${node.attrs.level}`;
                    }
                    return "Type '/' for commands, or start writing...";
                },
                emptyEditorClass: 'is-editor-empty before:text-gray-400 dark:before:text-gray-500 before:float-left before:content-[attr(data-placeholder)] before:pointer-events-none before:h-0'
            })
        ],
        content: initialContent,
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            setHasChanges(true);

            const currentContent = task?.postContentType === "json" && task?.postContent
                ? safeJsonParse(task.postContent)
                : {};

            setEditedTask({
                ...task,
                postContent: JSON.stringify({ ...currentContent, description: html }),
                postContentType: "json",
            });

            // Check for slash command
            const { state } = editor;
            const { selection } = state;
            const { $from } = selection;

            // Look backwards for slash
            const textBefore = $from.parent.textBetween(Math.max(0, $from.parentOffset - 20), $from.parentOffset, undefined, "\ufffc");

            const slashMatch = textBefore.match(/(?:^|\s)\/([a-zA-Z0-9]*)$/);

            if (slashMatch) {
                const matchLength = slashMatch[1].length + 1; // +1 for slash
                const range = {
                    from: $from.pos - matchLength,
                    to: $from.pos,
                };

                setSlashCommandRange(range);
                setSlashMenuFilter(slashMatch[1]);
                setSlashMenuOpen(true);
                setSlashMenuIndex(0);

                // Calculate position
                const startPos = editor.view.coordsAtPos(range.from);
                setSlashMenuPosition({
                    x: startPos.left,
                    y: startPos.bottom + 10
                });
            } else {
                setSlashMenuOpen(false);
            }
        },
        editorProps: {
            attributes: {
                class: "notion-editor focus:outline-none max-w-full min-h-[200px] py-4 px-1",
            },
        },
    });

    // Handle Slash Command Navigation
    useEffect(() => {
        if (!editor) return;

        editor.setOptions({
            editorProps: {
                handleKeyDown: (view, event) => {
                    if (slashMenuOpen) {
                        if (event.key === 'ArrowUp') {
                            event.preventDefault();
                            setSlashMenuIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
                            return true;
                        }
                        if (event.key === 'ArrowDown') {
                            event.preventDefault();
                            setSlashMenuIndex((prev) => (prev + 1) % filteredCommands.length);
                            return true;
                        }
                        if (event.key === 'Enter') {
                            event.preventDefault();
                            if (filteredCommands.length > 0) {
                                const item = filteredCommands[slashMenuIndex];
                                if (slashCommandRange) {
                                    item.command(editor, slashCommandRange);
                                    setSlashMenuOpen(false);
                                }
                            }
                            return true;
                        }
                        if (event.key === 'Escape') {
                            setSlashMenuOpen(false);
                            return true;
                        }
                    }
                    return false;
                },
                attributes: {
                    class: "notion-editor focus:outline-none max-w-full min-h-[200px] py-4 px-1",
                }
            }
        });
    }, [editor, slashMenuOpen, slashMenuIndex, filteredCommands, slashCommandRange]);

    useEffect(() => {
        if (editor && !isLoading && initialContent !== editor.getHTML()) {
            if (Math.abs(editor.getHTML().length - initialContent.length) > 10) {
                editor.commands.setContent(initialContent);
                setHasChanges(false);
            }
        }
    }, [editor, initialContent, isLoading]);

    useEffect(() => {
        if (isEditingDesc && editor && autoFocus) {
            setTimeout(() => {
                editor.commands.focus('end');
            }, 100);
        }
    }, [isEditingDesc, editor, autoFocus]);

    useEffect(() => {
        return () => {
            editor?.destroy();
        };
    }, [editor]);

    const handleSaveAndClose = useCallback(() => {
        if (hasChanges) {
            handleSave();
        }
        setIsEditingDesc(false);
        setHasChanges(false);
    }, [handleSave, hasChanges, setIsEditingDesc]);

    const handleCancel = useCallback(() => {
        if (editor && initialContent !== editor.getHTML()) {
            const shouldRevert = window.confirm(
                "You have unsaved changes. Are you sure you want to cancel?"
            );
            if (!shouldRevert) return;

            editor.commands.setContent(initialContent);
        }
        setIsEditingDesc(false);
        setHasChanges(false);
    }, [editor, initialContent, setIsEditingDesc]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isEditingDesc || !editor) return;

            if ((e.metaKey || e.ctrlKey) && e.key === 's') {
                e.preventDefault();
                handleSaveAndClose();
            }

            if (e.key === 'Escape' && !slashMenuOpen) {
                handleCancel();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isEditingDesc, editor, handleSaveAndClose, handleCancel, slashMenuOpen]);

    if (isLoading && !task) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
                    <span className="text-sm">Loading editor...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <Zap size={16} className="text-blue-500" />
                    Description
                    {hasChanges && (
                        <span className="text-xs text-orange-500 ml-2">• Unsaved changes</span>
                    )}
                </h2>
            </div>

            {isEditingDesc ? (
                <div className="rounded-lg overflow-hidden bg-white dark:bg-gray-850 border border-gray-200 dark:border-gray-700 shadow-sm transition-all duration-200 ring-1 ring-blue-500/20">
                    {editor && <NotionBubbleMenu editor={editor} />}
                    {slashMenuOpen && (
                        <SlashCommandMenu
                            items={filteredCommands}
                            selectedIndex={slashMenuIndex}
                            selectItem={(index) => {
                                const item = filteredCommands[index];
                                if (slashCommandRange && editor) {
                                    item.command(editor, slashCommandRange);
                                    setSlashMenuOpen(false);
                                }
                            }}
                            position={slashMenuPosition}
                        />
                    )}

                    <EditorContent
                        editor={editor}
                        className="notion-editor-container min-h-[150px]"
                    />

                    <style>{`
            .notion-editor {
              line-height: 1.6;
              font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              color: rgb(55 65 81);
            }
            .dark .notion-editor {
              color: rgb(209 213 219);
            }
            .notion-editor p { 
              margin: 0.5em 0; 
            }
            .notion-editor h1 { 
              font-size: 1.875rem; 
              font-weight: 700; 
              margin: 1.5em 0 0.5em; 
              line-height: 1.2;
              color: rgb(17 24 39);
            }
            .dark .notion-editor h1 { color: rgb(243 244 246); }
            
            .notion-editor h2 { 
              font-size: 1.5rem; 
              font-weight: 600; 
              margin: 1.25em 0 0.5em; 
              line-height: 1.3;
              color: rgb(31 41 55);
            }
            .dark .notion-editor h2 { color: rgb(229 231 235); }

            .notion-editor h3 { 
              font-size: 1.25rem; 
              font-weight: 600; 
              margin: 1em 0 0.5em; 
              line-height: 1.4;
              color: rgb(55 65 81);
            }
            .dark .notion-editor h3 { color: rgb(209 213 219); }

            .notion-editor code:not(.code-block) {
              background: rgba(135,131,120,0.15);
              color: #EB5757;
              padding: 0.2em 0.4em;
              border-radius: 3px;
              font-size: 0.85em;
              font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace;
            }
            .dark .notion-editor code:not(.code-block) {
              background: rgba(255,255,255,0.1);
              color: #ff7b72;
            }

            .notion-editor .code-block {
              background: rgb(247 247 245);
              border-radius: 4px;
              padding: 1rem;
              margin: 0.5rem 0;
              font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace;
              font-size: 0.85rem;
              overflow-x: auto;
              color: rgb(55 65 81);
            }
            .dark .notion-editor .code-block {
              background: rgb(32 32 32);
              color: rgb(209 213 219);
            }

            .notion-editor blockquote {
              border-left: 3px solid currentcolor;
              padding-left: 1rem;
              margin: 0.5rem 0;
              font-style: italic;
              opacity: 0.8;
            }

            .notion-editor ul { list-style-type: disc; }
            .notion-editor ol { list-style-type: decimal; }
            
            .notion-editor .is-editor-empty:first-child::before {
                color: #9ca3af;
                content: attr(data-placeholder);
                float: left;
                height: 0;
                pointer-events: none;
            }
          `}</style>

                    <div className="flex justify-between items-center p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                            <span className="px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700">⌘+S</span> to save
                            <span className="px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700">Esc</span> to cancel
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleCancel}
                                className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors duration-200"
                                type="button"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveAndClose}
                                disabled={!hasChanges}
                                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 shadow-sm"
                                type="button"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div
                    className="min-h-[80px] rounded-lg bg-white dark:bg-gray-850 border border-gray-200 dark:border-gray-700 p-4 cursor-pointer transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm group"
                    onClick={() => setIsEditingDesc(true)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setIsEditingDesc(true);
                        }
                    }}
                >
                    {initialContent && initialContent.trim() !== "<p></p>" ? (
                        <div
                            className="prose prose-sm max-w-none text-gray-800 dark:prose-invert prose-headings:font-semibold prose-blockquote:not-italic prose-pre:bg-transparent prose-pre:p-0 group-hover:opacity-90"
                            dangerouslySetInnerHTML={{ __html: initialContent }}
                        />
                    ) : (
                        <div className="flex items-center text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-400 transition-colors">
                            <Zap size={16} className="mr-2" />
                            <span className="text-sm">Click to add description...</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}