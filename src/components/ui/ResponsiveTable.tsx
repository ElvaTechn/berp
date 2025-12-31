import { ReactNode } from 'react';

interface TableColumn<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

interface ResponsiveTableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  emptyMessage?: string;
  className?: string;
}

export function ResponsiveTable<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = 'Nenhum registro encontrado',
  className = '',
}: ResponsiveTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-[var(--neu-text-muted)] p-4">
        <p className="neu-text-body">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto -mx-4 sm:mx-0 ${className}`}>
      <div className="min-w-full inline-block align-middle px-4 sm:px-0">
        <div className="overflow-hidden rounded-xl neu-convex-md">
          <table className="min-w-full divide-y divide-[var(--neu-border)]">
            <thead className="bg-[var(--neu-surface-hover)]">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`px-4 py-3 text-left text-xs sm:text-sm font-bold text-[var(--neu-text-muted)] uppercase tracking-wider ${
                      col.headerClassName || ''
                    }`}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--neu-border-light)]">
              {data.map((item) => (
                <tr
                  key={keyExtractor(item)}
                  className="hover:bg-[var(--neu-surface-hover)] transition-colors"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-4 py-3 text-xs sm:text-sm text-[var(--neu-text-secondary)] ${
                        col.className || ''
                      }`}
                    >
                      {col.render
                        ? col.render(item)
                        : String((item as Record<string, unknown>)[col.key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
