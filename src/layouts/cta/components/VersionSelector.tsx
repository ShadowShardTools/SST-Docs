import { memo } from "react";
import { GitBranch } from "lucide-react";
import LoadingSpinner from "../../dialog/components/LoadingSpinner";
import type { StyleTheme, Version } from "@shadow-shard-tools/docs-core";
import Dropdown from "../../common/components/Dropdown";

interface VersionSelectorProps {
  styles: StyleTheme;
  versions: Version[];
  currentVersion: string;
  onVersionChange: (version: string) => void;
  loading: boolean;
}

export const VersionSelector = memo<VersionSelectorProps>(
  ({ styles, versions, currentVersion, onVersionChange, loading }) => {
    if (loading) return <LoadingSpinner styles={styles} />;

    return (
      <Dropdown
        styles={styles}
        items={versions.map(({ version, label }) => ({
          value: version,
          label,
          icon: <GitBranch className="w-4 h-4" />,
        }))}
        selectedValue={currentVersion}
        onSelect={onVersionChange}
        placeholder="Select Version"
        disabled={!versions.length}
        className="min-w-[160px]"
      />
    );
  },
);

export default VersionSelector;
