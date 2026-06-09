import React from 'react';

// Safe inline Markdown parser for assistant replies
function renderInline(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);

  parts.forEach((part, i) => {
    if (/^\*\*[^*]+\*\*$/.test(part)) {
      nodes.push(
        <strong key={i} className="font-semibold text-slate-100">
          {part.slice(2, -2)}
        </strong>
      );
    } else if (/^`[^`]+`$/.test(part)) {
      nodes.push(
        <code
          key={i}
          className="rounded bg-slate-800 px-1 py-0.5 font-mono text-[0.85em] text-cyan-400"
        >
          {part.slice(1, -1)}
        </code>
      );
    } else if (part) {
      nodes.push(<React.Fragment key={i}>{part}</React.Fragment>);
    }
  });

  return nodes;
}

export function Markdown({ content }: { content: string }) {
  if (!content) return null;
  const blocks = content.split(/\n{2,}/);

  return (
    <>
      {blocks.map((block, i) => {
        const lines = block.split("\n");
        const isList = lines.every((l) => /^\s*[-*]\s+/.test(l)) && lines.length > 0;

        if (isList) {
          return (
            <ul key={i} className="my-1.5 ml-4 list-disc space-y-1">
              {lines.map((line, j) => (
                <li key={j}>{renderInline(line.replace(/^\s*[-*]\s+/, ""))}</li>
              ))}
            </ul>
          );
        }

        const isNumList = lines.every((l) => /^\s*\d+\.\s+/.test(l)) && lines.length > 0;
        if (isNumList) {
          return (
            <ol key={i} className="my-1.5 ml-4 list-decimal space-y-1">
              {lines.map((line, j) => (
                <li key={j}>{renderInline(line.replace(/^\s*\d+\.\s+/, ""))}</li>
              ))}
            </ol>
          );
        }

        return (
          <p key={i} className="my-1.5 first:mt-0 last:mb-0">
            {lines.map((line, j) => (
              <React.Fragment key={j}>
                {renderInline(line)}
                {j < lines.length - 1 && <br />}
              </React.Fragment>
            ))}
          </p>
        );
      })}
    </>
  );
}
