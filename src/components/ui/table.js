export function DataTable({ columns, rows, renderRow }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-panel)]/70 shadow-[0_15px_35px_-30px_rgba(0,0,0,.7)]">
      <table className="w-full min-w-[720px] text-sm">
        <thead>
          <tr className="border-b border-[var(--dash-border)]/70 text-left text-[var(--dash-muted)]">
            {columns.map((column) => (
              <th key={column} className="px-4 py-3 font-medium">{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => renderRow(row))}
        </tbody>
      </table>
    </div>
  );
}
