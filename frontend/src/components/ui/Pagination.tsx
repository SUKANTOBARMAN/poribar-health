interface Props {
  page: number;
  hasMore: boolean;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, hasMore, onPageChange }: Props) {
  return (
    <div className="mt-6 flex items-center justify-center gap-3">
      <button
        className="btn btn-secondary text-xs"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        ← আগের পাতা
      </button>
      <span className="text-sm text-slate-500">পাতা {page}</span>
      <button
        className="btn btn-secondary text-xs"
        disabled={!hasMore}
        onClick={() => onPageChange(page + 1)}
      >
        পরের পাতা →
      </button>
    </div>
  );
}