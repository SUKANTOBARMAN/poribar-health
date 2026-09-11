import type { CategoryOut } from "@/api/content";

interface Props {
  categories: CategoryOut[];
  value: number | null;
  onChange: (id: number | null) => void;
}

function buildOptions(categories: CategoryOut[], parentId: number | null = null, depth = 0): JSX.Element[] {
  return categories
    .filter((c) => c.parent_id === parentId)
    .flatMap((c) => [
      <option key={c.id} value={c.id}>{"— ".repeat(depth)}{c.name_bn}</option>,
      ...buildOptions(categories, c.id, depth + 1),
    ]);
}

export default function CategoryTree({ categories, value, onChange }: Props) {
  return (
    <select className="input" value={value || ""} onChange={(e) => onChange(Number(e.target.value) || null)}>
      <option value="">ক্যাটাগরি বেছে নাও</option>
      {buildOptions(categories)}
    </select>
  );
}