import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useKeyboardNavigation } from "../useKeyboardNavigation";
import { KEYBOARD_SHORTCUTS } from "../../constants";

describe("useKeyboardNavigation", () => {
  const mockToggle = vi.fn();
  const mockOnSelect = vi.fn();
  const mockSetCursor = vi.fn();
  const mockInputRef = { current: document.createElement("input") };

  const defaultProps = {
    entries: [
      {
        type: "doc",
        id: "doc1",
        key: "doc-doc1",
        depth: 0,
        item: { id: "doc1" },
      },
      {
        type: "category",
        id: "cat1",
        key: "cat-cat1",
        depth: 0,
        node: { id: "cat1" },
      },
    ] as any,
    cursor: 0,
    setCursor: mockSetCursor,
    open: {},
    toggle: mockToggle,
    onSelect: mockOnSelect,
    inputRef: mockInputRef as any,
  };

  it("should move cursor down on Ctrl+ArrowDown", () => {
    renderHook(() => useKeyboardNavigation(defaultProps));

    const event = new KeyboardEvent("keydown", {
      key: KEYBOARD_SHORTCUTS.ARROW_DOWN,
      ctrlKey: true,
    });
    window.dispatchEvent(event);

    expect(mockSetCursor).toHaveBeenCalled();
  });

  it("should toggle category on Ctrl+ArrowRight", () => {
    const props = { ...defaultProps, cursor: 1 }; // on category
    renderHook(() => useKeyboardNavigation(props));

    const event = new KeyboardEvent("keydown", {
      key: KEYBOARD_SHORTCUTS.ARROW_RIGHT,
      ctrlKey: true,
    });
    window.dispatchEvent(event);

    expect(mockToggle).toHaveBeenCalledWith("cat1");
  });

  it('should focus input when "f" is pressed', () => {
    const focusSpy = vi.spyOn(mockInputRef.current, "focus");
    renderHook(() => useKeyboardNavigation(defaultProps));

    const event = new KeyboardEvent("keydown", {
      key: KEYBOARD_SHORTCUTS.FILTER,
    });
    window.dispatchEvent(event);

    expect(focusSpy).toHaveBeenCalled();
  });
});
