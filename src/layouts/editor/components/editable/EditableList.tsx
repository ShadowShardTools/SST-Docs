import type React from "react";
import { useEffect, useRef } from "react";

interface EditableListItemProps {
  value: string;
  onChange: (next: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  innerRef: (el: HTMLDivElement | null) => void;
}

function EditableListItem({
  value,
  onChange,
  onKeyDown,
  innerRef,
}: EditableListItemProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && ref.current.innerText !== (value ?? "")) {
      ref.current.innerText = value ?? "";
    }
  }, [value]);

  return (
    <div
      ref={(el) => {
        ref.current = el;
        innerRef(el);
      }}
      contentEditable
      suppressContentEditableWarning
      className="inline outline-none bg-transparent leading-6 min-h-[1.25rem] align-middle"
      onInput={(e) => onChange((e.target as HTMLElement).innerText)}
      onKeyDown={onKeyDown}
    />
  );
}

interface EditableListProps {
  data: any;
  listClass: string;
  onChange: (items: string[]) => void;
}

export function EditableList({ data, listClass, onChange }: EditableListProps) {
  const items: string[] = (data?.items ?? []).length ? data.items : [""];
  const Tag = (data?.type === "ol" ? "ol" : "ul") as "ol" | "ul";
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  const focusItem = (index: number, placeAtEnd = true) => {
    requestAnimationFrame(() => {
      const target = itemRefs.current[index];
      if (!target) return;
      target.focus();
      const range = document.createRange();
      range.selectNodeContents(target);
      range.collapse(placeAtEnd);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    });
  };

  const handleItemChange = (index: number, text: string) => {
    const next = [...items];
    next[index] = text;
    onChange(next);
  };

  const handleSplit = (index: number) => {
    const target = itemRefs.current[index];
    const text = target?.innerText ?? items[index] ?? "";
    const selection = window.getSelection();
    let offset = text.length;
    if (
      selection &&
      selection.rangeCount > 0 &&
      target?.contains(selection.anchorNode)
    ) {
      const range = selection.getRangeAt(0);
      const preRange = range.cloneRange();
      preRange.selectNodeContents(target);
      preRange.setEnd(range.endContainer, range.endOffset);
      offset = preRange.toString().length;
    }
    const before = text.slice(0, offset);
    const after = text.slice(offset);

    const next = [...items];
    next[index] = before;
    next.splice(index + 1, 0, after);
    onChange(next);
    focusItem(index + 1, false);
  };

  const handleRemove = (index: number) => {
    if (items.length <= 1) {
      onChange([""]);
      focusItem(0, true);
      return;
    }
    const next = [...items];
    next.splice(index, 1);
    onChange(next);
    focusItem(Math.max(index - 1, 0), true);
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLDivElement>,
    index: number,
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSplit(index);
      return;
    }

    if (e.key === "Backspace") {
      const content = (e.currentTarget as HTMLElement).innerText;
      const isEmpty = !content || content.trim().length === 0;
      const selection = window.getSelection();
      const isAtStart =
        selection?.anchorOffset === 0 && selection?.focusOffset === 0;
      if (isEmpty && (isAtStart || selection?.isCollapsed)) {
        e.preventDefault();
        handleRemove(index);
      }
    }
  };

  return (
    <div className="bg-transparent border border-transparent focus-within:border-sky-400 rounded px-1.5 py-1.5">
      <Tag
        className={`${listClass} space-y-1`}
        role="list"
        aria-label={data?.ariaLabel}
        {...(Tag === "ol" && data?.startNumber !== undefined
          ? { start: data.startNumber }
          : {})}
      >
        {items.map((item, i) => (
          <li key={i} role="listitem">
            <EditableListItem
              value={item}
              innerRef={(el) => {
                itemRefs.current[i] = el;
              }}
              onChange={(next) => handleItemChange(i, next)}
              onKeyDown={(e) => handleKeyDown(e, i)}
            />
          </li>
        ))}
      </Tag>
    </div>
  );
}

