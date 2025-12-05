import React from 'react';

export type Crumb = {
  label: string;
  href?: string;
  onClick?: (e: React.MouseEvent) => void;
  icon?: React.ReactNode;
};

export function Breadcrumb({ items }: { items: Crumb[] }) {
  if (!items || items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="w-full">
      <ol className="flex items-center gap-2 text-sm text-gray-600">
        {items.map((it, idx) => {
          const isLast = idx === items.length - 1;

          const content = (
            <div className="flex items-center gap-1 max-w-full">
              {it.icon && (
                <span className="w-4 h-4 shrink-0" aria-hidden>
                  {it.icon}
                </span>
              )}
              <span
                className={`truncate ${isLast ? 'font-semibold text-gray-900' : 'hover:text-gray-900 hover:underline cursor-pointer'}`}
                title={it.label}
              >
                {it.label}
              </span>
            </div>
          );

          return (
            <li key={idx} className="flex items-center">
              {it.href && !isLast ? (
                <a
                  href={it.href}
                  onClick={it.onClick}
                  className="inline-flex items-center gap-1 max-w-[18rem]"
                >
                  {content}
                </a>
              ) : it.onClick && !isLast ? (
                <button
                  onClick={it.onClick}
                  className="inline-flex items-center gap-1 max-w-[18rem] text-left text-gray-600 hover:text-gray-900 hover:underline"
                >
                  {content}
                </button>
              ) : (
                <span
                  className="inline-flex items-center gap-1 max-w-[18rem] text-gray-900 font-semibold"
                  aria-current="page"
                >
                  {content}
                </span>
              )}

              {!isLast && (
                <span className="mx-2 text-gray-400" aria-hidden>
                  /
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
