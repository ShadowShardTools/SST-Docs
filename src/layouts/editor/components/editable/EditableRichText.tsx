import type { StyleTheme } from "@shadow-shard-tools/docs-core";
import type { ClipboardEvent, CSSProperties, KeyboardEvent } from "react";
import { Bold, Italic, Link2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { sanitizeRichText } from "../../../common/utils/richText";
import Button from "../../../common/components/Button";

const execCommand = (command: string, value?: string) => {
  if (typeof document === "undefined") return;
  document.execCommand(command, false, value);
};

interface EditableRichTextProps {
  value: string;
  styles: StyleTheme;
  className?: string;
  wrapperClassName?: string;
  style?: CSSProperties;
  onChange: (next: string) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLDivElement>) => void;
  onPaste?: (event: ClipboardEvent<HTMLDivElement>) => void;
  inputRef?: (el: HTMLDivElement | null) => void;
  tagName?: "div" | "ul" | "ol";
}

function isNodeInside(root: HTMLElement, node: Node | null) {
  if (!root || !node) return false;
  return node === root || root.contains(node);
}

function normalizeListDom(listEl: HTMLElement) {
  // 1) Ensure only LI children; wrap stray nodes into <li>
  const children = Array.from(listEl.childNodes);

  for (const node of children) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      if (el.tagName.toLowerCase() === "li") continue;

      const li = document.createElement("li");
      li.innerHTML =
        el.innerHTML && el.innerHTML.trim() ? el.innerHTML : "<br>";
      listEl.replaceChild(li, el);
      continue;
    }

    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent ?? "";
      if (!text.trim()) {
        listEl.removeChild(node);
        continue;
      }
      const li = document.createElement("li");
      li.textContent = text;
      listEl.replaceChild(li, node);
    }
  }

  // 2) Ensure each LI has a placeholder when empty
  const lis = Array.from(listEl.querySelectorAll("li"));
  for (const li of lis) {
    const raw = li.innerHTML ?? "";
    const empty =
      !raw ||
      raw === "<br>" ||
      raw === "<br/>" ||
      (li.textContent ?? "").trim() === "";

    if (empty) {
      // Avoid thrashing if already has a single BR-ish placeholder
      if (raw !== "<br>") li.innerHTML = "<br>";
    }
  }

  // 3) Ensure at least one LI exists
  if (listEl.querySelectorAll("li").length === 0) {
    const li = document.createElement("li");
    li.innerHTML = "<br>";
    listEl.appendChild(li);
  }
}

function getClosestLi(node: Node | null): HTMLLIElement | null {
  if (!node) return null;
  const el =
    node.nodeType === Node.ELEMENT_NODE
      ? (node as Element)
      : node.parentElement;
  return (el?.closest?.("li") as HTMLLIElement) ?? null;
}

function isLiEmpty(li: HTMLLIElement): boolean {
  const raw = (li.innerHTML ?? "").trim().toLowerCase();
  if (!raw) return true;
  if (raw === "<br>" || raw === "<br/>") return true;
  return (li.textContent ?? "").trim() === "";
}

function placeCaretAtEnd(el: HTMLElement) {
  const sel = window.getSelection();
  if (!sel) return;
  const range = document.createRange();
  range.selectNodeContents(el);
  range.collapse(false);
  sel.removeAllRanges();
  sel.addRange(range);
}

function placeCaretAtStart(el: HTMLElement) {
  const sel = window.getSelection();
  if (!sel) return;
  const range = document.createRange();
  range.selectNodeContents(el);
  range.collapse(true);
  sel.removeAllRanges();
  sel.addRange(range);
}

// Checks whether caret is at the very start of `li` (collapsed selection)
function caretAtStartOfLi(li: HTMLLIElement, range: Range): boolean {
  const test = document.createRange();
  test.selectNodeContents(li);
  test.setEnd(range.startContainer, range.startOffset);
  return test.toString().length === 0;
}

export function EditableRichText({
  value,
  styles,
  className = "",
  wrapperClassName = "relative",
  style,
  onChange,
  onKeyDown,
  onPaste,
  inputRef,
  tagName = "div",
}: EditableRichTextProps) {
  const ref = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const selectionRangeRef = useRef<Range | null>(null);

  const [toolbar, setToolbar] = useState({
    visible: false,
    top: 0,
    left: 0,
    placement: "above" as "above" | "below",
  });

  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    link: false,
  });

  const toolbarClass = `absolute z-30 flex items-center gap-1 rounded-lg border px-1.5 py-1 shadow-lg ${styles.modal.content} ${styles.modal.borders}`;

  const setInputRef = useCallback(
    (el: HTMLDivElement | null) => {
      ref.current = el;
      if (inputRef) inputRef(el);
    },
    [inputRef],
  );

  const hideToolbar = useCallback(() => {
    selectionRangeRef.current = null;
    setToolbar((prev) => (prev.visible ? { ...prev, visible: false } : prev));
  }, []);

  const updateToolbar = useCallback(() => {
    const textEl = ref.current;
    const wrapperEl = wrapperRef.current;
    if (!textEl || !wrapperEl) {
      hideToolbar();
      return;
    }

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      hideToolbar();
      return;
    }

    const range = selection.getRangeAt(0);
    if (
      !textEl.contains(range.commonAncestorContainer) &&
      textEl !== range.commonAncestorContainer
    ) {
      hideToolbar();
      return;
    }

    const rect = range.getBoundingClientRect();
    if (!rect || (rect.width === 0 && rect.height === 0)) {
      hideToolbar();
      return;
    }

    selectionRangeRef.current = range.cloneRange();
    const wrapperRect = wrapperEl.getBoundingClientRect();
    const offset = 8;

    const left = rect.left - wrapperRect.left + rect.width / 2;
    const top = rect.top - wrapperRect.top;
    const bottom = rect.bottom - wrapperRect.top;

    const placeBelow = top < 40;
    const nextTop = placeBelow ? bottom + offset : top - offset;

    setToolbar({
      visible: true,
      top: nextTop,
      left,
      placement: placeBelow ? "below" : "above",
    });

    const container =
      range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE
        ? (range.commonAncestorContainer as Element)
        : range.commonAncestorContainer.parentElement;

    const nextFormats = {
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      link: !!container?.closest("a"),
    };

    setActiveFormats((prev) =>
      prev.bold === nextFormats.bold &&
      prev.italic === nextFormats.italic &&
      prev.link === nextFormats.link
        ? prev
        : nextFormats,
    );
  }, [hideToolbar]);

  // IMPORTANT: normalize list DOM during typing so browser never stays in broken state
  const commitValueRawNormalized = () => {
    const el = ref.current;
    if (!el) return;

    const sel = window.getSelection();
    const shouldPreserve =
      !!sel &&
      sel.rangeCount > 0 &&
      isNodeInside(el, sel.anchorNode) &&
      isNodeInside(el, sel.focusNode);

    const savedRange = shouldPreserve ? sel!.getRangeAt(0).cloneRange() : null;

    if (tagName === "ul" || tagName === "ol") {
      normalizeListDom(el);
    }

    if (savedRange && sel) {
      try {
        sel.removeAllRanges();
        sel.addRange(savedRange);
      } catch {
        // ignore restore failures
      }
    }

    onChange(el.innerHTML);
  };

  const commitValueSanitized = () => {
    if (!ref.current) return;
    onChange(sanitizeRichText(ref.current.innerHTML, styles));
  };

  const applyCommand = (command: "bold" | "italic") => {
    ref.current?.focus();
    const selection = window.getSelection();
    if (selectionRangeRef.current && selection) {
      selection.removeAllRanges();
      selection.addRange(selectionRangeRef.current);
    }
    execCommand(command);
    commitValueRawNormalized();
    updateToolbar();
  };

  const applyLink = () => {
    if (!ref.current) return;
    const selection = window.getSelection();
    if (!selection) return;

    const activeRange =
      selectionRangeRef.current ??
      (selection.rangeCount > 0 ? selection.getRangeAt(0) : null);
    if (!activeRange) return;

    const savedRange = activeRange.cloneRange();
    const href = window.prompt("Enter link URL");
    if (!href) return;

    selection.removeAllRanges();
    selection.addRange(savedRange);

    execCommand("createLink", href);

    // FIX: Apply theme classes immediately after creation so the editor shows styling without needing a re-render/preview
    if (styles?.hyperlink?.link) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const container = selection.getRangeAt(0).commonAncestorContainer;
        const parent =
          container.nodeType === Node.ELEMENT_NODE
            ? (container as Element)
            : container.parentElement;
        const link = parent?.closest("a");
        if (link && !link.className) {
          link.className = styles.hyperlink.link;
        }
      }
    }

    commitValueRawNormalized();
    updateToolbar();
  };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const isActive = document.activeElement === el;
    const nextHtml = sanitizeRichText(value ?? "", styles);

    if (!isActive && el.innerHTML !== nextHtml) {
      el.innerHTML = nextHtml;
    }
  }, [value]);

  useEffect(() => {
    const handleSelection = () => updateToolbar();
    document.addEventListener("selectionchange", handleSelection);
    window.addEventListener("resize", handleSelection);
    window.addEventListener("scroll", handleSelection, true);
    return () => {
      document.removeEventListener("selectionchange", handleSelection);
      window.removeEventListener("resize", handleSelection);
      window.removeEventListener("scroll", handleSelection, true);
    };
  }, [updateToolbar]);

  const Tag = tagName as any;

  return (
    <div ref={wrapperRef} className={wrapperClassName}>
      {toolbar.visible && (
        <div
          className={toolbarClass}
          style={{
            top: toolbar.top,
            left: toolbar.left,
            transform:
              toolbar.placement === "below"
                ? "translate(-50%, 0)"
                : "translate(-50%, -100%)",
          }}
        >
          <Button
            type="button"
            className="inline-flex items-center justify-center w-7 h-7 text-xs"
            styles={styles}
            variant={activeFormats.bold ? "tabActive" : "tab"}
            onClick={() => applyCommand("bold")}
            onMouseDown={(event: React.MouseEvent) => event.preventDefault()}
          >
            <Bold className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            className="inline-flex items-center justify-center w-7 h-7 text-xs"
            styles={styles}
            variant={activeFormats.italic ? "tabActive" : "tab"}
            onClick={() => applyCommand("italic")}
            onMouseDown={(event: React.MouseEvent) => event.preventDefault()}
          >
            <Italic className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            className="inline-flex items-center justify-center w-7 h-7 text-xs"
            styles={styles}
            variant={activeFormats.link ? "tabActive" : "tab"}
            onClick={applyLink}
            onMouseDown={(event: React.MouseEvent) => event.preventDefault()}
          >
            <Link2 className="w-4 h-4" />
          </Button>
        </div>
      )}

      <Tag
        ref={setInputRef}
        contentEditable
        suppressContentEditableWarning
        className={className}
        style={style ?? { whiteSpace: "pre-wrap" }}
        onInput={commitValueRawNormalized}
        onMouseUp={updateToolbar}
        onKeyUp={updateToolbar}
        onBlur={() => {
          hideToolbar();
          // sanitize on blur (safe)
          commitValueSanitized();
        }}
        onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => {
          if (
            (event.ctrlKey || event.metaKey) &&
            event.key.toLowerCase() === "l"
          ) {
            event.preventDefault();
            event.stopPropagation();
            applyLink();
            return;
          }

          // LIST-SPECIFIC BACKSPACE FIX
          if (
            (tagName === "ul" || tagName === "ol") &&
            event.key === "Backspace"
          ) {
            const root = ref.current;
            const sel = window.getSelection();
            if (root && sel && sel.rangeCount > 0) {
              const range = sel.getRangeAt(0);

              // only handle collapsed caret (no selection)
              if (range.collapsed && root.contains(range.startContainer)) {
                const li = getClosestLi(range.startContainer);
                if (li && root.contains(li)) {
                  const empty = isLiEmpty(li);
                  const atStart = caretAtStartOfLi(li, range);

                  // Case A: empty LI -> remove it (if possible) or keep one placeholder
                  if (empty) {
                    event.preventDefault();

                    const prev =
                      li.previousElementSibling as HTMLLIElement | null;
                    const next = li.nextElementSibling as HTMLLIElement | null;

                    if (prev) {
                      li.remove();
                      // ensure prev has something selectable
                      if (isLiEmpty(prev)) prev.innerHTML = "<br>";
                      placeCaretAtEnd(prev);
                    } else if (next) {
                      // If it's the first and empty, keep list, move caret to start of next
                      // or keep current as placeholder if you prefer.
                      li.remove();
                      if (isLiEmpty(next)) next.innerHTML = "<br>";
                      placeCaretAtStart(next);
                    } else {
                      // only item in list: keep one empty placeholder
                      li.innerHTML = "<br>";
                      placeCaretAtStart(li);
                    }

                    // commit + normalize
                    commitValueRawNormalized();
                    updateToolbar();
                    return;
                  }

                  // Case B: non-empty but caret at start -> merge with previous LI if exists
                  if (atStart) {
                    const prev =
                      li.previousElementSibling as HTMLLIElement | null;
                    if (prev) {
                      event.preventDefault();

                      // Merge: prev += current HTML (preserve formatting)
                      const prevWasEmpty = isLiEmpty(prev);
                      if (prevWasEmpty) prev.innerHTML = "";

                      // Save merge point (end of prev before append)
                      // Simple: append then place caret at end of prev
                      prev.innerHTML =
                        (prev.innerHTML || "") + (li.innerHTML || "");
                      li.remove();

                      if (isLiEmpty(prev)) prev.innerHTML = "<br>";
                      placeCaretAtEnd(prev);

                      commitValueRawNormalized();
                      updateToolbar();
                      return;
                    }
                  }
                }
              }
            }
          }

          onKeyDown?.(event);
        }}
        onPaste={onPaste}
      />
    </div>
  );
}

export default EditableRichText;
