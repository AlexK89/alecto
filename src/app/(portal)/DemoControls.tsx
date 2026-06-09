import { ChevronLeft, ChevronRight, FlaskConical } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DEMO_CHECKPOINTS } from "@/domain/demo/checkpoints";

type DemoControlsProps = {
  stageIndex: number;
};

const stageHref = (index: number): string => (index === 0 ? "/" : `/?stage=${index}`);

export const DemoControls = ({ stageIndex }: DemoControlsProps) => {
  const current = DEMO_CHECKPOINTS[stageIndex];
  const previousIndex = Math.max(0, stageIndex - 1);
  const nextIndex = Math.min(DEMO_CHECKPOINTS.length - 1, stageIndex + 1);
  const isFirst = stageIndex === 0;
  const isLast = stageIndex === DEMO_CHECKPOINTS.length - 1;

  return (
    <section className="mb-6 rounded-xl border border-dashed border-indigo-300 bg-indigo-50/60 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-medium text-indigo-900">
          <FlaskConical className="size-4" aria-hidden />
          Demo: step through the case
          <span className="text-indigo-900/60">·</span>
          <span className="text-indigo-900/80">
            Stage {stageIndex + 1} of {DEMO_CHECKPOINTS.length} — {current.label}
          </span>
          {current.isProjected ? (
            <Badge variant="secondary" className="bg-indigo-200 text-indigo-900">
              Projected
            </Badge>
          ) : null}
        </div>

        <div className="flex items-center gap-1.5">
          <Link
            href={stageHref(previousIndex)}
            aria-disabled={isFirst}
            className={cn(
              "inline-flex items-center gap-1 rounded-md border bg-card px-2.5 py-1 text-xs font-medium",
              isFirst ? "pointer-events-none opacity-40" : "hover:bg-muted",
            )}
          >
            <ChevronLeft className="size-3.5" aria-hidden />
            Back
          </Link>
          <Link
            href={stageHref(nextIndex)}
            aria-disabled={isLast}
            className={cn(
              "inline-flex items-center gap-1 rounded-md border bg-card px-2.5 py-1 text-xs font-medium",
              isLast ? "pointer-events-none opacity-40" : "hover:bg-muted",
            )}
          >
            Next
            <ChevronRight className="size-3.5" aria-hidden />
          </Link>
        </div>
      </div>

      <ol className="mt-3 flex flex-wrap gap-1.5">
        {DEMO_CHECKPOINTS.map((checkpoint, index) => (
          <li key={checkpoint.at}>
            <Link
              href={stageHref(index)}
              className={cn(
                "block rounded-full border px-2.5 py-0.5 text-xs transition-colors",
                index === stageIndex
                  ? "border-indigo-500 bg-indigo-500 text-white"
                  : "border-indigo-200 bg-card text-indigo-900/70 hover:bg-indigo-100",
              )}
            >
              {checkpoint.label}
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
};
