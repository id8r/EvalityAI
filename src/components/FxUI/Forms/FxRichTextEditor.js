/* src/components/FxUI/Forms/FxRichTextEditor.js | Branded rich-text editor (Tiptap engine, hidden) → HTML | Sree | 2026-06-28 */

"use client";

import { useEffect, useState } from "react";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { CharacterCount, Placeholder } from "@tiptap/extensions";
import {
  Bold,
  Code2,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  RemoveFormatting,
  Strikethrough,
  Underline as UnderlineIcon,
  Undo2,
} from "lucide-react";

import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/FxUtils";
/* - - - - - - - - - - - - - - - - */

/*
  Public Fx rich-text editor. The Tiptap/ProseMirror engine is an implementation detail — callers only ever touch
  the Fx surface (HTML in via `value`, HTML out via `onChange`). Styling comes from the shared `.fx-prose` class
  (globals.css) so the editable view and the read-only <FxRichText> renderer are identical.

  Controlled (`value` HTML + `onChange(html)`) or uncontrolled (`defaultValue`). `toolbar`: true (full, default),
  false (hidden), or an array of feature ids to whitelist (e.g. ["bold","italic","bulletList","link"]).
*/

// Toolbar groups. `run` receives a focused command chain and returns it; `active` reads the editor-state snapshot.
const GROUPS = [
  [
    { id: "bold", icon: Bold, title: "Bold", active: (s) => s.bold, run: (c) => c.toggleBold() },
    { id: "italic", icon: Italic, title: "Italic", active: (s) => s.italic, run: (c) => c.toggleItalic() },
    { id: "underline", icon: UnderlineIcon, title: "Underline", active: (s) => s.underline, run: (c) => c.toggleUnderline() },
    { id: "strike", icon: Strikethrough, title: "Strikethrough", active: (s) => s.strike, run: (c) => c.toggleStrike() },
    { id: "code", icon: Code2, title: "Inline code", active: (s) => s.code, run: (c) => c.toggleCode() },
  ],
  [
    { id: "h1", icon: Heading1, title: "Heading 1", active: (s) => s.h1, run: (c) => c.toggleHeading({ level: 1 }) },
    { id: "h2", icon: Heading2, title: "Heading 2", active: (s) => s.h2, run: (c) => c.toggleHeading({ level: 2 }) },
    { id: "h3", icon: Heading3, title: "Heading 3", active: (s) => s.h3, run: (c) => c.toggleHeading({ level: 3 }) },
  ],
  [
    { id: "bulletList", icon: List, title: "Bullet list", active: (s) => s.bulletList, run: (c) => c.toggleBulletList() },
    { id: "orderedList", icon: ListOrdered, title: "Numbered list", active: (s) => s.orderedList, run: (c) => c.toggleOrderedList() },
    { id: "blockquote", icon: Quote, title: "Quote", active: (s) => s.blockquote, run: (c) => c.toggleBlockquote() },
    { id: "hr", icon: Minus, title: "Divider", active: () => false, run: (c) => c.setHorizontalRule() },
  ],
  [
    { id: "undo", icon: Undo2, title: "Undo", active: () => false, disabled: (s) => !s.canUndo, run: (c) => c.undo() },
    { id: "redo", icon: Redo2, title: "Redo", active: () => false, disabled: (s) => !s.canRedo, run: (c) => c.redo() },
    { id: "clear", icon: RemoveFormatting, title: "Clear formatting", active: () => false, run: (c) => c.clearNodes().unsetAllMarks() },
  ],
];

const EMPTY_STATE = {};

function normalizeHref(url) {
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (/^(https?:|mailto:|tel:|#|\/)/i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function ToolbarButton({ icon: Icon, title, active, disabled, onClick }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={cn(
        "inline-flex size-7 items-center justify-center rounded-[5px] text-[var(--fx-text-muted)] transition-colors hover:bg-[var(--fx-surface-hover)] hover:text-[var(--fx-text)]",
        "disabled:pointer-events-none disabled:opacity-40",
        active && "bg-[var(--fx-surface-selected)] text-[var(--fx-primary)]",
      )}
    >
      <Icon className="size-4" />
    </button>
  );
}

function ToolbarDivider() {
  return <span aria-hidden="true" className="mx-0.5 h-5 w-px bg-[var(--fx-border)]" />;
}
/* - - - - - - - - - - - - - - - - */

function FxRichTextEditor({
  value,
  defaultValue = "",
  onChange,
  label,
  hint,
  message,
  required = false,
  disabled = false,
  placeholder = "Write here…",
  toolbar = true,
  toolbarPosition = "top",
  minHeight = 180,
  maxHeight,
  maxLength,
  showCount = false,
  fill = false, // stretch to fill a flex parent (content area scrolls) instead of growing with content
  resizable = false, // show a corner grip so the author can drag the composer taller
  id,
  className,
  contentClassName,
  onBlur,
  onFocus,
}) {
  const isControlled = value !== undefined;
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  const editor = useEditor({
    immediatelyRender: false, // SSR-safe (Next app router)
    editable: !disabled,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        link: {
          openOnClick: false,
          autolink: true,
          defaultProtocol: "https",
          HTMLAttributes: { rel: "noopener noreferrer nofollow", target: "_blank" },
        },
      }),
      Placeholder.configure({ placeholder }),
      ...(maxLength != null ? [CharacterCount.configure({ limit: maxLength })] : showCount ? [CharacterCount] : []),
    ],
    content: isControlled ? value : defaultValue,
    editorProps: {
      attributes: { class: "fx-prose fx-rte-content px-3.5 py-2.5", spellcheck: "true" },
    },
    onUpdate: ({ editor }) => onChange?.(editor.isEmpty ? "" : editor.getHTML()),
    onBlur: ({ event }) => onBlur?.(event),
    onFocus: ({ event }) => onFocus?.(event),
  });

  // Reactive snapshot for the toolbar (active marks, history availability, char count).
  const state =
    useEditorState({
      editor,
      selector: ({ editor }) => {
        if (!editor) return EMPTY_STATE;
        return {
          bold: editor.isActive("bold"),
          italic: editor.isActive("italic"),
          underline: editor.isActive("underline"),
          strike: editor.isActive("strike"),
          code: editor.isActive("code"),
          h1: editor.isActive("heading", { level: 1 }),
          h2: editor.isActive("heading", { level: 2 }),
          h3: editor.isActive("heading", { level: 3 }),
          bulletList: editor.isActive("bulletList"),
          orderedList: editor.isActive("orderedList"),
          blockquote: editor.isActive("blockquote"),
          link: editor.isActive("link"),
          canUndo: editor.can().undo(),
          canRedo: editor.can().redo(),
          chars: editor.storage.characterCount ? editor.storage.characterCount.characters() : 0,
        };
      },
    }) ?? EMPTY_STATE;

  // Keep the editor in sync when a controlled `value` changes from outside (avoid clobbering local typing).
  useEffect(() => {
    if (!editor || !isControlled) return;
    const incoming = value ?? "";
    const currentHtml = editor.isEmpty ? "" : editor.getHTML();
    if (incoming !== currentHtml) editor.commands.setContent(incoming, { emitUpdate: false });
  }, [editor, isControlled, value]);

  useEffect(() => {
    editor?.setEditable(!disabled);
  }, [editor, disabled]);

  const allow = Array.isArray(toolbar) ? new Set(toolbar) : null;
  const showToolbar = toolbar !== false && !disabled;
  const showLink = !allow || allow.has("link");

  function runItem(item) {
    if (!editor) return;
    item.run(editor.chain().focus()).run();
  }

  function openLink() {
    if (!editor) return;
    setLinkUrl(editor.getAttributes("link").href ?? "");
    setLinkOpen(true);
  }

  function applyLink() {
    if (!editor) return;
    const href = normalizeHref(linkUrl);
    const chain = editor.chain().focus().extendMarkRange("link");
    if (href) chain.setLink({ href }).run();
    else chain.unsetLink().run();
    setLinkOpen(false);
  }

  const visibleGroups = GROUPS.map((group) => group.filter((item) => !allow || allow.has(item.id))).filter((group) => group.length);
  const toolbarNode = showToolbar ? (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-[var(--fx-border)] bg-[var(--fx-surface-subtle)] px-2 py-1.5">
      {visibleGroups.map((group, index) => (
        <div key={group[0].id} className="flex items-center gap-0.5">
          {index > 0 ? <ToolbarDivider /> : null}
          {group.map((item) => (
            <ToolbarButton
              key={item.id}
              icon={item.icon}
              title={item.title}
              active={item.active(state)}
              disabled={!editor || (item.disabled ? item.disabled(state) : false)}
              onClick={() => runItem(item)}
            />
          ))}
          {/* Link lives at the end of the block group via the insert popover. */}
          {index === 2 && showLink ? (
            <Popover open={linkOpen} onOpenChange={setLinkOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  title="Link"
                  aria-label="Link"
                  aria-pressed={Boolean(state.link)}
                  disabled={!editor}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={openLink}
                  className={cn(
                    "inline-flex size-7 items-center justify-center rounded-[5px] text-[var(--fx-text-muted)] transition-colors hover:bg-[var(--fx-surface-hover)] hover:text-[var(--fx-text)] disabled:pointer-events-none disabled:opacity-40",
                    state.link && "bg-[var(--fx-surface-selected)] text-[var(--fx-primary)]",
                  )}
                >
                  <Link2 className="size-4" />
                </button>
              </PopoverTrigger>
              <PopoverContent align="start" sideOffset={6} className="w-72 p-2">
                <div className="flex items-center gap-1.5">
                  <input
                    autoFocus
                    value={linkUrl}
                    onChange={(event) => setLinkUrl(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        applyLink();
                      }
                    }}
                    placeholder="https://example.com"
                    className="h-8 min-w-0 flex-1 rounded-[5px] border border-[var(--fx-border)] bg-[var(--fx-surface)] px-2.5 text-[13px] text-[var(--fx-text)] outline-none focus:border-[var(--fx-primary)]"
                  />
                  <button
                    type="button"
                    onClick={applyLink}
                    className="h-8 shrink-0 rounded-[5px] bg-[var(--fx-primary)] px-3 text-[13px] font-medium text-[var(--fx-primary-foreground)] hover:bg-[var(--fx-primary-hover)]"
                  >
                    {normalizeHref(linkUrl) ? "Apply" : "Remove"}
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          ) : null}
        </div>
      ))}
    </div>
  ) : null;

  return (
    <div className={cn("flex w-full flex-col gap-2", fill && "min-h-0 flex-1", className)}>
      {label ? (
        <Label htmlFor={id}>
          {label}
          {required ? <span className="ml-1 text-[var(--fx-danger)]">*</span> : null}
        </Label>
      ) : null}

      <div
        style={{ "--fx-rte-min": `${minHeight}px` }}
        className={cn(
          "overflow-hidden rounded-[6px] border border-[var(--fx-border)] bg-[var(--fx-surface)] transition-colors",
          "focus-within:border-[var(--fx-primary)] focus-within:ring-2 focus-within:ring-[var(--fx-ring)]",
          fill && "flex min-h-0 flex-1 flex-col", // stretch to the parent; the content area handles its own scroll
          resizable && "resize-y", // corner grip — drag to grow (overflow-hidden gives the handle a box)
          disabled && "opacity-60",
          message && "border-[var(--fx-danger)]",
        )}
      >
        <div
          style={{
            minHeight: "var(--fx-rte-min)",
            ...(maxHeight ? { maxHeight, overflowY: "auto" } : {}),
          }}
          className={cn(contentClassName, "min-h-[var(--fx-rte-min)]", fill && "min-h-0 flex-1 overflow-y-auto")}
        >
          <EditorContent editor={editor} />
        </div>

        {toolbarPosition === "bottom" ? toolbarNode : null}

        {showCount || maxLength != null ? (
          <div className="flex justify-end border-t border-[var(--fx-border)] px-3 py-1 text-[12px] text-[var(--fx-text-muted)]">
            {maxLength != null ? `${state.chars ?? 0} / ${maxLength}` : `${state.chars ?? 0} characters`}
          </div>
        ) : null}

        {toolbarPosition !== "bottom" ? toolbarNode : null}
      </div>

      {message ? (
        <p className="text-[13px] text-[var(--fx-danger)]">{message}</p>
      ) : hint ? (
        <p className="text-[13px] text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
/* - - - - - - - - - - - - - - - - */
export { FxRichTextEditor };
/* - - - - - - - - - - - - - - - - */
