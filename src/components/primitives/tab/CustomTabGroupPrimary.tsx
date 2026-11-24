"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { ICustomTabGroupPrimary } from "@/types";

//* useLayoutEffect WARNS DURING SSR. THE MEASUREMENT BELOW MUST STILL RUN
//* BEFORE PAINT ON THE CLIENT, OTHERWISE THE PILL VISIBLY JUMPS FROM 0 ON MOUNT.
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

//* THE ACTIVE PILL IS MEASURED FROM THE DOM RATHER THAN COMPUTED FROM THE ACTIVE
//* INDEX: TRIGGER WIDTHS ARE CONTENT-DRIVEN (LABEL LENGTH, OPTIONAL ICON AND
//* COUNT BADGE) AND SHIFT AGAIN ONCE THE WEBFONT SWAPS IN.
export default function CustomTabGroupPrimary({
  tabList,
  tabContent,
  defaultTab,
  value,
  onValueChange,
  fullWidth = false,
  wrap = false,
  rightSlot,
  className,
  listClassName,
  contentClassName,
}: ICustomTabGroupPrimary) {
  const [uncontrolledTab, setUncontrolledTab] = useState(
    () => defaultTab ?? tabList[0]?.value ?? "",
  );
  const isControlled = value !== undefined;
  const activeTab = isControlled ? value : uncontrolledTab;

  const listRef = useRef<HTMLDivElement>(null);
  const triggerRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const hasMountedRef = useRef(false);

  const [pill, setPill] = useState({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    ready: false,
  });
  const [overflow, setOverflow] = useState({ start: false, end: false });

  const syncOverflow = useCallback(() => {
    const list = listRef.current;
    if (!list) return;
    const maxScroll = list.scrollWidth - list.clientWidth;
    setOverflow({
      start: list.scrollLeft > 1,
      end: maxScroll > 1 && list.scrollLeft < maxScroll - 1,
    });
  }, []);

  const measure = useCallback(() => {
    const list = listRef.current;
    const node = triggerRefs.current[activeTab];
    if (!list || !node) return;

    //* TOP/HEIGHT ARE MEASURED TOO — A WRAPPED TRACK PUTS TABS ON LATER ROWS.
    setPill({
      left: node.offsetLeft,
      top: node.offsetTop,
      width: node.offsetWidth,
      height: node.offsetHeight,
      ready: true,
    });

    //* KEEP THE ACTIVE TAB IN VIEW WHEN THE TRACK SCROLLS ON NARROW SCREENS.
    //* scrollIntoView IS AVOIDED HERE — IT WOULD ALSO SCROLL THE PAGE BODY.
    const maxScroll = list.scrollWidth - list.clientWidth;
    if (maxScroll > 1) {
      const centered =
        node.offsetLeft - (list.clientWidth - node.offsetWidth) / 2;
      list.scrollTo({
        left: Math.min(Math.max(centered, 0), maxScroll),
        behavior: hasMountedRef.current ? "smooth" : "auto",
      });
    }
    syncOverflow();
  }, [activeTab, syncOverflow]);

  useIsomorphicLayoutEffect(() => {
    measure();
    hasMountedRef.current = true;
  }, [measure]);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const observer = new ResizeObserver(measure);
    observer.observe(list);
    //* TRIGGERS ARE OBSERVED TOO — A COUNT BADGE GOING 9 → 10 RESIZES ONE TAB
    //* AND SHIFTS EVERY TAB AFTER IT WITHOUT THE TRACK ITSELF CHANGING SIZE.
    Object.values(triggerRefs.current).forEach((node) => {
      if (node) observer.observe(node);
    });

    //* THE WEBFONT SWAP RE-FLOWS LABELS AFTER THE FIRST MEASUREMENT.
    document.fonts?.ready.then(measure).catch(() => {});

    return () => observer.disconnect();
  }, [measure, tabList]);

  const handleValueChange = (next: string) => {
    if (!isControlled) setUncontrolledTab(next);
    onValueChange?.(next);
  };

  return (
    <Tabs
      value={activeTab}
      onValueChange={handleValueChange}
      className={cn("flex w-full flex-col gap-6", className)}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          className={cn(
            "relative min-w-0",
            fullWidth ? "w-full" : "w-fit max-w-full",
          )}
        >
          <TabsList
            ref={listRef}
            onScroll={syncOverflow}
            className={cn(
              //* h-auto UNDOES THE FIXED HEIGHT THE SHARED TabsList SETS.
              //* justify-start UNDOES ITS justify-center: CENTRED ITEMS THAT
              //* OVERFLOW SPILL PAST THE LEFT EDGE, WHERE SCROLLING CAN'T REACH.
              "relative flex h-auto w-full items-center justify-start gap-1 rounded-2xl border border-neutralPrimary-300/80 bg-neutralPrimary-100/70 p-1.5",
              wrap ? "flex-wrap" : "overflow-x-auto",
              "shadow-[inset_0_1px_2px_rgba(17,24,39,0.04)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
              listClassName,
            )}
          >
            {/* SLIDING PILL — PAINTED BEHIND THE TRIGGERS, NEVER FOCUSABLE */}
            <span
              aria-hidden
              style={{
                transform: `translate3d(${pill.left}px, ${pill.top}px, 0)`,
                width: pill.width,
                height: pill.height,
              }}
              className={cn(
                "pointer-events-none absolute top-0 left-0 z-0 rounded-xl bg-white",
                "shadow-[0_1px_2px_rgba(17,24,39,0.06),0_6px_16px_-6px_rgba(17,24,39,0.20)] ring-1 ring-neutralPrimary-900/5",
                "transition-[transform,width,height,opacity] duration-500 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
                pill.ready ? "opacity-100" : "opacity-0",
              )}
            >
              {/* BRAND ACCENT — TIES THE CONTROL TO THE NATURA PALETTE */}
              <span className="absolute inset-x-4 bottom-0 h-0.5 rounded-full bg-gradient-to-r from-greenPrimary-400 to-greenPrimary-600" />
            </span>

            {tabList.map((tab) => {
              const isActive = tab.value === activeTab;

              return (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  disabled={tab.disabled}
                  ref={(node: HTMLButtonElement | null) => {
                    triggerRefs.current[tab.value] = node;
                  }}
                  className={cn(
                    //* flex-none AND h-auto UNDO THE STRETCHING THE SHARED
                    //* TabsTrigger APPLIES, SO WIDTHS STAY CONTENT-DRIVEN.
                    "group relative z-10 inline-flex h-auto flex-none shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2",
                    "text-sm font-medium whitespace-nowrap transition-colors duration-200 outline-none select-none",
                    "focus-visible:ring-2 focus-visible:ring-greenPrimary-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-neutralPrimary-100",
                    "disabled:pointer-events-none disabled:opacity-40",
                    fullWidth && "flex-1",
                    isActive
                      ? "text-neutralPrimary-800 font-semibold"
                      : "text-neutralPrimary-500 hover:text-neutralPrimary-700",
                  )}
                >
                  {tab.icon ? (
                    <span
                      className={cn(
                        "inline-flex items-center justify-center transition-colors duration-200 [&_svg]:size-4 [&_svg]:shrink-0",
                        isActive
                          ? "text-greenPrimary-600"
                          : "text-neutralPrimary-400 group-hover:text-neutralPrimary-600",
                      )}
                    >
                      {tab.icon}
                    </span>
                  ) : null}

                  {tab.label}

                  {typeof tab.count === "number" ? (
                    <span
                      className={cn(
                        "inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] leading-none font-semibold tabular-nums transition-colors duration-200",
                        isActive
                          ? "bg-greenPrimary-500/15 text-greenPrimary-600"
                          : "bg-neutralPrimary-300/80 text-neutralPrimary-500 group-hover:bg-neutralPrimary-300",
                      )}
                    >
                      {tab.count}
                    </span>
                  ) : null}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* EDGE FADES — SIGNAL THAT THE TRACK SCROLLS ON NARROW SCREENS */}
          <span
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-y-px left-px w-10 rounded-l-2xl bg-gradient-to-r from-neutralPrimary-100 to-transparent transition-opacity duration-200",
              overflow.start ? "opacity-100" : "opacity-0",
            )}
          />
          <span
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-y-px right-px w-10 rounded-r-2xl bg-gradient-to-l from-neutralPrimary-100 to-transparent transition-opacity duration-200",
              overflow.end ? "opacity-100" : "opacity-0",
            )}
          />
        </div>

        {rightSlot ? <div className="shrink-0">{rightSlot}</div> : null}
      </div>

      {/* Content is optional: a URL-driven listing renders one view below the
          bar instead of a panel per tab. */}
      {tabContent?.map((tab) => (
        <TabsContent
          key={tab.value}
          value={tab.value}
          className={cn(
            "w-full outline-none",
            tab.value === activeTab &&
              "animate-in fade-in-0 slide-in-from-bottom-2 duration-300 [animation-timing-function:cubic-bezier(0.22,1,0.36,1)] motion-reduce:animate-none",
            contentClassName,
          )}
        >
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}
