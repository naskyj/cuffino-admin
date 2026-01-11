"use client";

import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Strikethrough,
} from "lucide-react";
import * as React from "react";
import {
  Control,
  FieldPath,
  FieldValues,
  useController,
} from "react-hook-form";

import { cn } from "@/lib/utils";

interface RichTextEditorProps<T extends FieldValues = FieldValues>
  extends Omit<React.ComponentProps<"div">, "name"> {
  name: FieldPath<T>;
  control: Control<T>;
  label?: string;
  placeholder?: string;
  className?: string;
  wrapperClassName?: string;
}

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  children: React.ReactNode;
  title?: string;
}

const ToolbarButton = ({
  onClick,
  isActive,
  children,
  title,
}: ToolbarButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={cn(
      "p-2 rounded hover:bg-gray-100 transition-colors",
      isActive && "bg-gray-200"
    )}
  >
    {children}
  </button>
);

const RichTextEditor = <T extends FieldValues = FieldValues>({
  name,
  control,
  label,
  placeholder,
  className,
  wrapperClassName,
  ...props
}: RichTextEditorProps<T>) => {
  const [isMounted, setIsMounted] = React.useState(false);
  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control,
  });

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline",
        },
      }),
      Placeholder.configure({
        placeholder: placeholder || "Start typing...",
      }),
    ],
    content: field.value || "",
    immediatelyRender: false,
    onUpdate: ({ editor: editorInstance }) => {
      const html = editorInstance.getHTML();
      field.onChange(html === "<p></p>" ? "" : html);
    },
    onBlur: field.onBlur,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none min-h-[120px] focus:outline-none px-3 py-2",
      },
    },
  });

  React.useEffect(() => {
    if (editor && field.value !== editor.getHTML()) {
      editor.commands.setContent(field.value || "");
    }
  }, [field.value, editor]);

  if (!isMounted || !editor) {
    return (
      <div className={cn("w-full", wrapperClassName)}>
        {label && (
          <label
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2 block"
            htmlFor={name}
          >
            {label}
          </label>
        )}
        <div
          className={cn(
            "rich-text-editor-wrapper border border-input rounded-md bg-background min-h-[120px]",
            error && "rich-text-editor-error border-red-500",
            className
          )}
        >
          <div className="p-3 text-sm text-muted-foreground">
            {placeholder || "Start typing..."}
          </div>
        </div>
        {error && <p className="mt-1 text-sm text-red-500">{error.message}</p>}
      </div>
    );
  }

  return (
    <div className={cn("w-full", wrapperClassName)}>
      {label && (
        <label
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2 block"
          htmlFor={name}
        >
          {label}
        </label>
      )}
      <div
        className={cn(
          "rich-text-editor-wrapper border border-input rounded-md bg-background",
          error && "rich-text-editor-error border-red-500",
          className
        )}
        {...props}
      >
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-1 p-2 border-b border-input bg-gray-50 rounded-t-md">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive("bold")}
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive("italic")}
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive("strike")}
            title="Strikethrough"
          >
            <Strikethrough className="w-4 h-4" />
          </ToolbarButton>
          <div className="w-px h-6 bg-gray-300 mx-1" />
          <ToolbarButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            isActive={editor.isActive("heading", { level: 1 })}
            title="Heading 1"
          >
            <Heading1 className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            isActive={editor.isActive("heading", { level: 2 })}
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            isActive={editor.isActive("heading", { level: 3 })}
            title="Heading 3"
          >
            <Heading3 className="w-4 h-4" />
          </ToolbarButton>
          <div className="w-px h-6 bg-gray-300 mx-1" />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive("bulletList")}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive("orderedList")}
            title="Ordered List"
          >
            <ListOrdered className="w-4 h-4" />
          </ToolbarButton>
          <div className="w-px h-6 bg-gray-300 mx-1" />
          <ToolbarButton
            onClick={() => {
              const url = window.prompt("Enter URL:");
              if (url) {
                editor.chain().focus().setLink({ href: url }).run();
              }
            }}
            isActive={editor.isActive("link")}
            title="Add Link"
          >
            <LinkIcon className="w-4 h-4" />
          </ToolbarButton>
        </div>

        {/* Editor Content */}
        <div className="relative min-h-[120px]">
          <EditorContent editor={editor} />
        </div>
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error.message}</p>}
    </div>
  );
};

RichTextEditor.displayName = "RichTextEditor";

export { RichTextEditor };
