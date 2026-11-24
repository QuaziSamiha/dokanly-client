"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  Calendar,
  ChevronRight,
  CornerDownRight,
  Eye,
  EyeOff,
  FileText,
  FolderTree,
  Layers,
  ListOrdered,
  Menu,
  Network,
  Package,
  Star,
} from "lucide-react";
import CancelButton from "@/components/primitives/button/CancelButton";
import { useGet } from "@/hooks/api/useGet";
import {
  CategoryStatus,
  ICategory,
  ICategoryNode,
} from "@/modules/category/types/category.types";
import { IModal } from "@/types";
import { isHiddenByParent } from "./category.columns";

// SEO preview is hidden for now; restore with the SEO section below.
// const SEO_TITLE_LIMIT = 60;
// const SEO_DESCRIPTION_LIMIT = 160;

const formatDate = (value?: string) =>
  value
    ? new Date(value).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "—";

const STATUS_STYLES: Record<CategoryStatus, { pill: string; dot: string }> = {
  ACTIVE: {
    pill: "bg-success-100 text-success-600 ring-success-600/20",
    dot: "bg-success-600",
  },
  INACTIVE: {
    pill: "bg-destructive-100 text-destructive-600 ring-destructive-600/20",
    dot: "bg-destructive-600",
  },
  ARCHIVED: {
    pill: "bg-warningPrimary-100 text-warningPrimary-600 ring-warningPrimary-600/20",
    dot: "bg-warningPrimary-600",
  },
};

// Staggered fade/slide-in for the modal's blocks (tw-animate-css).
const ENTER =
  "animate-in fade-in slide-in-from-bottom-3 duration-500 ease-out fill-mode-backwards motion-reduce:animate-none";
const enterDelay = (ms: number): React.CSSProperties => ({
  animationDelay: `${ms}ms`,
});

// Shared lift-on-hover for cards.
const LIFT =
  "transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0";

function StatusPill({ status }: { status?: CategoryStatus }) {
  if (!status) return null;
  const style = STATUS_STYLES[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold capitalize ring-1 ring-inset transition-transform duration-300 hover:scale-105 ${style.pill}`}
    >
      <span className="relative flex h-1.5 w-1.5">
        {status === "ACTIVE" && (
          <span
            className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 motion-reduce:animate-none ${style.dot}`}
          />
        )}
        <span className={`relative h-1.5 w-1.5 rounded-full ${style.dot}`} />
      </span>
      {status.toLowerCase()}
    </span>
  );
}

function StatTile({
  icon,
  label,
  value,
  hint,
  className,
  delay = 0,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  hint?: string;
  className: string;
  delay?: number;
}) {
  return (
    <div
      className={`group relative min-w-0 cursor-default overflow-hidden rounded-xl p-3 sm:p-4 ${ENTER} ${LIFT} ${className}`}
      style={enterDelay(delay)}
    >
      {/* Decorative glow that grows on hover */}
      <span className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-current opacity-[0.06] transition-transform duration-500 ease-out group-hover:scale-[2.2]" />
      <div className="flex min-w-0 items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide opacity-80 sm:gap-2 sm:text-xs">
        <span className="shrink-0 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-125">
          {icon}
        </span>
        <span className="truncate">{label}</span>
      </div>
      <p className="mt-1.5 origin-left text-xl font-bold transition-transform duration-300 group-hover:scale-110 sm:mt-2 sm:text-2xl">
        {value}
      </p>
      {hint && (
        <p className="mt-0.5 line-clamp-2 break-words text-[11px] opacity-70 sm:text-xs">
          {hint}
        </p>
      )}
    </div>
  );
}

function Flag({
  on,
  icon,
  label,
  onText,
  offText,
  delay = 0,
}: {
  on: boolean;
  icon: React.ReactNode;
  label: string;
  onText: string;
  offText: string;
  delay?: number;
}) {
  return (
    <div
      style={enterDelay(delay)}
      className={`group flex cursor-default items-center gap-3 rounded-xl border p-3 ${ENTER} ${LIFT} ${
        on
          ? "border-greenPrimary-200 bg-greenPrimary-950 hover:border-greenPrimary-400"
          : "border-neutralPrimary-100 bg-neutralPrimary-50 hover:border-neutralPrimary-200"
      }`}
    >
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110 ${
          on
            ? "bg-greenPrimary-600 text-white"
            : "bg-neutralPrimary-200 text-neutralPrimary-500"
        }`}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-neutralPrimary-700">{label}</p>
        <p
          className={`text-xs ${
            on ? "text-greenPrimary-600" : "text-neutralPrimary-400"
          }`}
        >
          {on ? onText : offText}
        </p>
      </div>
    </div>
  );
}

function Section({
  icon,
  title,
  aside,
  children,
  delay = 0,
}: {
  icon: React.ReactNode;
  title: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <section
      style={enterDelay(delay)}
      className={`${ENTER} group rounded-xl border border-neutralPrimary-100 bg-white p-3 transition-all duration-300 hover:border-greenPrimary-200 hover:shadow-md sm:p-4`}
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-neutralPrimary-700">
          <span className="text-greenPrimary-500 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110">
            {icon}
          </span>
          {title}
        </h3>
        {aside}
      </div>
      {children}
    </section>
  );
}

// function CharCount({ length, limit }: { length: number; limit: number }) {
//   const over = length > limit;
//   return (
//     <span
//       className={`text-[11px] font-medium ${
//         over ? "text-destructive-600" : "text-neutralPrimary-400"
//       }`}
//     >
//       {length}/{limit}
//     </span>
//   );
// }

type TreeRole = "ancestor" | "parent" | "current" | "child" | "grandchild";

const ROLE_STYLES: Record<TreeRole, { row: string; tag: string; label: string }> =
  {
    ancestor: {
      row: "border-neutralPrimary-100 bg-neutralPrimary-50 text-neutralPrimary-500",
      tag: "bg-neutralPrimary-200 text-neutralPrimary-600",
      label: "Ancestor",
    },
    parent: {
      row: "border-purpleSecondary-100 bg-purpleSecondary-100/50 text-neutralPrimary-700",
      tag: "bg-purpleSecondary-100 text-purpleSecondary-500",
      label: "Parent",
    },
    current: {
      row: "border-greenPrimary-300 bg-greenPrimary-950 text-greenPrimary-700 font-semibold",
      tag: "bg-greenPrimary-600 text-white",
      label: "This category",
    },
    child: {
      row: "border-blueSecondary-100 bg-blueSecondary-50 text-neutralPrimary-700",
      tag: "bg-blueSecondary-100 text-blueSecondary-600",
      label: "Child",
    },
    grandchild: {
      row: "border-orangeSecondary-100 bg-orangeSecondary-100/40 text-neutralPrimary-600",
      tag: "bg-orangeSecondary-100 text-orangeSecondary-500",
      label: "Grandchild",
    },
  };

function TreeRow({
  role,
  indent,
  name,
  status,
  productCount,
  childrenCount,
  order = 0,
}: {
  role: TreeRole;
  indent: number;
  name: string;
  status?: CategoryStatus;
  productCount?: number;
  childrenCount?: number;
  order?: number;
}) {
  const style = ROLE_STYLES[role];
  return (
    <li
      // Indent is half as deep on phones so nested rows keep room for the name.
      className="group flex animate-in items-center gap-1.5 pl-[calc(var(--indent)*0.75rem)] fade-in slide-in-from-left-3 duration-500 ease-out fill-mode-backwards motion-reduce:animate-none sm:gap-2 sm:pl-[calc(var(--indent)*1.5rem)]"
      style={
        {
          "--indent": indent,
          // Start once the hierarchy section itself has faded in.
          ...enterDelay(620 + order * 60),
        } as React.CSSProperties
      }
    >
      {indent > 0 && (
        <CornerDownRight
          size={14}
          className="shrink-0 text-neutralPrimary-300 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-greenPrimary-500"
        />
      )}
      <div
        className={`flex min-w-0 flex-1 cursor-default flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border px-2.5 py-2 text-sm transition-all duration-300 ease-out group-hover:translate-x-1 group-hover:shadow-md motion-reduce:transition-none motion-reduce:group-hover:translate-x-0 sm:flex-nowrap sm:px-3 ${style.row}`}
      >
        <span className="flex min-w-0 flex-1 items-center gap-2">
          {status && (
            <span
              title={status.toLowerCase()}
              className={`h-2 w-2 shrink-0 rounded-full ${STATUS_STYLES[status].dot}`}
            />
          )}
          <span className="truncate">{name}</span>
          {status && status !== "ACTIVE" && (
            <span className="shrink-0 text-xs font-normal capitalize text-neutralPrimary-400">
              ({status.toLowerCase()})
            </span>
          )}
        </span>
        <span className="ml-auto flex shrink-0 items-center gap-1.5">
          {productCount !== undefined && (
            <span
              title="Products"
              className="inline-flex items-center gap-1 rounded bg-white/80 px-1.5 text-xs font-semibold text-greenPrimary-600"
            >
              <Package size={11} />
              {productCount}
            </span>
          )}
          {!!childrenCount && (
            <span
              title="Subcategories"
              className="inline-flex items-center gap-1 rounded bg-white/80 px-1.5 text-xs font-semibold text-blueSecondary-600"
            >
              <FolderTree size={11} />
              {childrenCount}
            </span>
          )}
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide transition-transform duration-300 group-hover:scale-110 ${style.tag}`}
          >
            {style.label}
          </span>
        </span>
      </div>
    </li>
  );
}

function AuditRow({
  label,
  date,
  user,
}: {
  label: string;
  date?: string;
  user?: { name: string } | null;
}) {
  return (
    <div className="group flex cursor-default items-center gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blueSecondary-100 text-sm font-semibold text-blueSecondary-600 transition-all duration-300 group-hover:scale-110 group-hover:bg-blueSecondary-600 group-hover:text-white group-hover:shadow-md">
        {user?.name ? user.name.charAt(0).toUpperCase() : <Calendar size={16} />}
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-neutralPrimary-400">
          {label}
        </p>
        <p className="break-words text-sm text-neutralPrimary-700 sm:truncate">
          {formatDate(date)}
          {user?.name && (
            <span className="text-neutralPrimary-400"> by {user.name}</span>
          )}
        </p>
      </div>
    </div>
  );
}

function CategoryImage({ src, name }: { src: string | null; name: string }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-greenPrimary-500 to-greenPrimary-700 text-2xl font-bold sm:h-20 sm:w-20 sm:text-3xl text-greenPrimary-50 shadow-md transition-all duration-500 ease-out hover:-rotate-6 hover:scale-110 hover:shadow-xl">
        {name.charAt(0).toUpperCase()}
      </div>
    );
  }
  return (
    // imageUrl is free text and may point at any host, so next/image's
    // remotePatterns would reject it.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={name}
      onError={() => setFailed(true)}
      className="h-16 w-16 shrink-0 rounded-2xl sm:h-20 sm:w-20 border-2 border-white object-cover shadow-md transition-all duration-500 ease-out hover:-rotate-3 hover:scale-110 hover:shadow-xl"
    />
  );
}

function HierarchyTree({ category }: { category: ICategory }) {
  const ancestors = category.ancestors?.length
    ? category.ancestors
    : category.parent
    ? [category.parent]
    : [];
  const children: ICategoryNode[] = category.children ?? [];

  if (ancestors.length === 0 && children.length === 0) {
    return (
      <p className="text-sm italic text-neutralPrimary-400">
        Top-level category with no subcategories.
      </p>
    );
  }

  const base = ancestors.length;
  let order = 0; // stagger index, in display order
  return (
    <ul className="space-y-1.5">
      {ancestors.map((node, i) => {
        const isParent = i === ancestors.length - 1;
        return (
          <TreeRow
            key={`a-${node.id}`}
            role={isParent ? "parent" : "ancestor"}
            indent={i}
            order={order++}
            name={node.name}
            // Only the direct parent carries a status in the admin DTO.
            status={isParent ? category.parent?.status : undefined}
          />
        );
      })}
      <TreeRow
        role="current"
        indent={base}
        order={order++}
        name={category.name}
        status={category.status}
        productCount={category.productCount}
        childrenCount={category.childrenCount ?? children.length}
      />
      {children.map((child) => (
        <React.Fragment key={`c-${child.id}`}>
          <TreeRow
            role="child"
            indent={base + 1}
            order={order++}
            name={child.name}
            status={child.status}
            productCount={child.productCount}
            childrenCount={child.childrenCount ?? child.children?.length}
          />
          {child.children?.map((grandchild) => (
            <TreeRow
              key={`g-${grandchild.id}`}
              role="grandchild"
              indent={base + 2}
              order={order++}
              name={grandchild.name}
              status={grandchild.status}
              productCount={grandchild.productCount}
              childrenCount={grandchild.childrenCount}
            />
          ))}
        </React.Fragment>
      ))}
    </ul>
  );
}

export default function ViewCategory({ data, setOpen }: IModal) {
  const rowData = data as ICategory | undefined;

  // The table row only has direct children; the hierarchy endpoint adds the
  // full ancestor chain and a second level (grandchildren).
  const { data: hierarchy, isLoading: isHierarchyLoading } =
    useGet<ICategory>(
      `categories/hierarchy/${rowData?.id}`,
      ["getCategoryHierarchy", String(rowData?.id)],
      undefined,
      !!rowData?.id,
    );

  if (!rowData) {
    return (
      <div className="flex flex-col items-center gap-2 p-10 text-center text-neutralPrimary-400">
        <FolderTree size={32} />
        No category details available.
      </div>
    );
  }

  const category: ICategory = hierarchy ? { ...rowData, ...hierarchy } : rowData;
  const hiddenByParent = isHiddenByParent(category);
  const depth = category.depth ?? category.ancestors?.length ?? 0;
  const childrenCount =
    category.childrenCount ?? category.children?.length ?? 0;
  const grandchildrenCount = (category.children ?? []).reduce(
    (sum, child) => sum + (child.children?.length ?? 0),
    0,
  );
  const trail = category.ancestors?.length
    ? category.ancestors
    : category.parent
    ? [category.parent]
    : [];
  // const seoTitle = category.seoTitle || category.name;
  // const seoDescription = category.seoDescription || category.description || "";

  return (
    <div className="space-y-4 p-4 sm:space-y-5 sm:p-6">
      {/* Hero */}
      <div
        className={`${ENTER} group/hero relative overflow-hidden rounded-2xl bg-gradient-to-br from-greenPrimary-950 via-white to-yellowSecondary-100 p-4 ring-1 sm:p-5 ring-greenPrimary-100 transition-shadow duration-500 hover:shadow-lg hover:ring-greenPrimary-200`}
      >
        {/* Light sheen that sweeps across on hover */}
        <span className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/70 to-transparent opacity-0 transition-all duration-1000 ease-out group-hover/hero:left-full group-hover/hero:opacity-100 motion-reduce:hidden" />
        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <CategoryImage src={category.imageUrl} name={category.name} />

          <div className="min-w-0 flex-1 space-y-2">
            {trail.length > 0 && (
              <nav className="flex flex-wrap items-center gap-1 text-xs text-neutralPrimary-400">
                {trail.map((node) => (
                  <React.Fragment key={node.id}>
                    <span className="break-all transition-colors duration-200 hover:text-greenPrimary-600">
                      {node.name}
                    </span>
                    <ChevronRight size={12} className="shrink-0" />
                  </React.Fragment>
                ))}
                <span className="break-all font-semibold text-greenPrimary-600">
                  {category.name}
                </span>
              </nav>
            )}

            <div className="flex flex-wrap items-center gap-2">
              <h2 className="min-w-0 break-words text-xl font-bold text-neutralPrimary-800 sm:text-2xl">
                {category.name}
              </h2>
              <StatusPill status={category.status} />
              {category.isFeatured && (
                <span className="group/star inline-flex items-center gap-1 rounded-full bg-yellowSecondary-100 px-2.5 py-1 text-xs font-semibold text-yellowSecondary-800 transition-transform duration-300 hover:scale-105">
                  <Star
                    size={12}
                    className="fill-current transition-transform duration-700 group-hover/star:rotate-[216deg] group-hover/star:scale-125"
                  />
                  Featured
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Visibility warning */}
      {hiddenByParent && (
        <div
          style={enterDelay(80)}
          className={`${ENTER} flex items-start gap-3 rounded-xl border border-warningPrimary-200 bg-warningPrimary-100 p-3 text-sm text-warningPrimary-600`}
        >
          <AlertTriangle
            size={18}
            className="mt-0.5 shrink-0 animate-pulse motion-reduce:animate-none"
          />
          <p>
            <span className="font-semibold">Hidden from the shop.</span> This
            category is active, but its parent{" "}
            <span className="font-semibold">{category.parent?.name}</span> is{" "}
            {category.parent?.status?.toLowerCase()}.
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4">
        <StatTile
          icon={<Package size={14} />}
          label="Products"
          value={category.productCount ?? 0}
          hint="Directly in this category"
          className="bg-greenPrimary-950 text-greenPrimary-700"
          delay={100}
        />
        <StatTile
          icon={<FolderTree size={14} />}
          label="Subcategories"
          value={childrenCount}
          hint={
            childrenCount
              ? `${grandchildrenCount} grandchild${
                  grandchildrenCount === 1 ? "" : "ren"
                }`
              : "No children"
          }
          className="bg-blueSecondary-50 text-blueSecondary-600"
          delay={170}
        />
        <StatTile
          icon={<Layers size={14} />}
          label="Level"
          value={depth + 1}
          hint={
            depth === 0
              ? "Top level"
              : `Nested under ${category.parent?.name ?? "parent"}`
          }
          className="bg-purpleSecondary-100 text-purpleSecondary-500"
          delay={240}
        />
        <StatTile
          icon={<ListOrdered size={14} />}
          label="Sort Order"
          value={category.sortOrder ?? 0}
          hint="Lower shows first"
          className="bg-orangeSecondary-100 text-orangeSecondary-500"
          delay={310}
        />
      </div>

      {/* Visibility */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Flag
          on={category.status === "ACTIVE" && !hiddenByParent}
          icon={
            category.status === "ACTIVE" && !hiddenByParent ? (
              <Eye size={18} />
            ) : (
              <EyeOff size={18} />
            )
          }
          label="Storefront"
          onText="Visible to customers"
          offText="Not visible to customers"
          delay={380}
        />
        <Flag
          on={category.showInMenu}
          icon={<Menu size={18} />}
          label="Navigation Menu"
          onText="Shown in menu"
          offText="Not in menu"
          delay={440}
        />
        <Flag
          on={category.isFeatured}
          icon={<Star size={18} />}
          label="Featured"
          onText="Highlighted on the shop"
          offText="Not featured"
          delay={500}
        />
      </div>

      {/* Hierarchy */}
      <Section
        delay={560}
        icon={<Network size={16} />}
        title="Category Hierarchy"
        aside={
          isHierarchyLoading && (
            <span className="text-[11px] text-neutralPrimary-400">
              Loading…
            </span>
          )
        }
      >
        <HierarchyTree category={category} />
      </Section>

      {/* Description */}
      <Section
        delay={620}
        icon={<FileText size={16} />}
        title="Description"
      >
        {category.description ? (
          <p className="whitespace-pre-line break-words text-sm leading-relaxed text-neutralPrimary-600">
            {category.description}
          </p>
        ) : (
          <p className="text-sm italic text-neutralPrimary-400">
            No description added.
          </p>
        )}
      </Section>

      {/* SEO — hidden for now. Restore together with SEO_TITLE_LIMIT,
          SEO_DESCRIPTION_LIMIT, CharCount, seoTitle/seoDescription and the
          Search icon import.
      <Section
        icon={<Search size={16} />}
        title="SEO Preview"
        aside={
          !category.seoTitle || !category.seoDescription ? (
            <span className="rounded-full bg-yellowSecondary-100 px-2 py-0.5 text-[11px] font-semibold text-yellowSecondary-800">
              Using fallbacks
            </span>
          ) : (
            <span className="rounded-full bg-success-100 px-2 py-0.5 text-[11px] font-semibold text-success-600">
              Complete
            </span>
          )
        }
      >
        <div className="rounded-lg bg-neutralPrimary-50 p-3">
          <p className="truncate text-xs text-neutralPrimary-400">
            naturacarebd.com › category › {category.slug}
          </p>
          <p className="mt-0.5 truncate text-base font-medium text-blueSecondary-600">
            {seoTitle}
          </p>
          <p className="mt-0.5 line-clamp-2 text-sm text-neutralPrimary-500">
            {seoDescription || (
              <span className="italic">No meta description.</span>
            )}
          </p>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutralPrimary-400">
                SEO Title
              </span>
              {category.seoTitle && (
                <CharCount
                  length={category.seoTitle.length}
                  limit={SEO_TITLE_LIMIT}
                />
              )}
            </div>
            <p className="break-words text-neutralPrimary-700">
              {category.seoTitle || "— (falls back to name)"}
            </p>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutralPrimary-400">
                SEO Description
              </span>
              {category.seoDescription && (
                <CharCount
                  length={category.seoDescription.length}
                  limit={SEO_DESCRIPTION_LIMIT}
                />
              )}
            </div>
            <p className="break-words text-neutralPrimary-700">
              {category.seoDescription || "— (falls back to description)"}
            </p>
          </div>
        </div>
      </Section>
      */}

      {/* Audit */}
      <div
        style={enterDelay(680)}
        className={`${ENTER} grid grid-cols-1 gap-3 rounded-xl bg-neutralPrimary-50 p-3 sm:grid-cols-2 sm:gap-4 sm:p-4`}
      >
        <AuditRow
          label="Created"
          date={category.createdAt}
          user={category.createdBy}
        />
        <AuditRow
          label="Last Updated"
          date={category.updatedAt}
          user={category.updatedBy}
        />
      </div>

      <div className="flex justify-end border-t border-neutralPrimary-100 pt-4">
        <CancelButton
          onClick={() => setOpen?.(false)}
          label="Close"
          className="w-full transition-all hover:-translate-y-0.5 sm:w-auto hover:border-greenPrimary-300 hover:bg-greenPrimary-950 hover:text-greenPrimary-700 hover:shadow-md active:translate-y-0 active:scale-95"
        />
      </div>
    </div>
  );
}
