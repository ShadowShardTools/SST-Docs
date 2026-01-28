export interface BreadcrumbSegment {
  label: string;
  onSelect?: () => void;
  href?: string;
}
