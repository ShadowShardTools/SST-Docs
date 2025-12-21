import type { StyleTheme } from "@shadow-shard-tools/docs-core";

interface Props {
  index: number;
  type: string;
  styles: StyleTheme;
}

export const UnknownBlock: React.FC<Props> = ({ index, type, styles }) => {
  const warningTone = styles.messageBox.warning || "sst-msg-warning";

  return (
    <div
      key={index}
      className={`mb-4 p-3 rounded-md ${warningTone}`}
      role="status"
    >
      <p>Unknown content type: {type}</p>
    </div>
  );
};

export default UnknownBlock;
