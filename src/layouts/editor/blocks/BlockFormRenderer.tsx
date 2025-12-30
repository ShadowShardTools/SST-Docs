import type { Content } from "@shadow-shard-tools/docs-core";
import { BLOCK_LABELS } from "./blockRegistry";
import { TitleBlockForm } from "./forms/TitleBlockForm";
import { TextBlockForm } from "./forms/TextBlockForm";
import { ListBlockForm } from "./forms/ListBlockForm";
import { MessageBoxBlockForm } from "./forms/MessageBoxBlockForm";
import { DividerBlockForm } from "./forms/DividerBlockForm";
import { CodeBlockForm } from "./forms/CodeBlockForm";
import { ChartBlockForm } from "./forms/ChartBlockForm";
import { TableBlockForm } from "./forms/TableBlockForm";

interface Props {
  block: Content;
  onChange: (updated: Content) => void;
}

export function BlockFormRenderer({ block, onChange }: Props) {
  const render = () => {
    switch (block.type) {
      case "title":
        return (
          <TitleBlockForm
            block={block}
            onChange={(b) => onChange(b)}
          />
        );
      case "text":
        return (
          <TextBlockForm
            block={block}
            onChange={(b) => onChange(b)}
          />
        );
      case "list":
        return (
          <ListBlockForm
            block={block}
            onChange={(b) => onChange(b)}
          />
        );
      case "messageBox":
        return (
          <MessageBoxBlockForm
            block={block}
            onChange={(b) => onChange(b)}
          />
        );
      case "divider":
        return (
          <DividerBlockForm
            block={block}
            onChange={(b) => onChange(b)}
          />
        );
      case "code":
        return (
          <CodeBlockForm
            block={block}
            onChange={(b) => onChange(b)}
          />
        );
      case "table":
        return (
          <TableBlockForm
            block={block}
            onChange={(b) => onChange(b)}
          />
        );
      case "chart":
        return (
          <ChartBlockForm
            block={block}
            onChange={(b) => onChange(b)}
          />
        );
      default:
        return (
          <p className="text-sm text-slate-600 dark:text-slate-300">
            No quick form for {BLOCK_LABELS[block.type] ?? block.type}. Edit via JSON for now.
          </p>
        );
    }
  };

  return <div className="space-y-4">{render()}</div>;
}

export default BlockFormRenderer;
