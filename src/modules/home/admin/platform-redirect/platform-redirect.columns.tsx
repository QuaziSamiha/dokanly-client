import { ColumnDef } from "@tanstack/react-table";
import { IconType } from "react-icons";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaYoutube } from "react-icons/fa";
import { Share2 } from "lucide-react";
import { IHomeContent } from "@/modules/home/types/home-content.types";
import {
  ActionsCell,
  BADGE_BASE,
  LinkCell,
  PositionCell,
  StatusCell,
  Thumbnail,
  UpdatedCell,
} from "../home-content.cells";

type Platform = NonNullable<IHomeContent["platformType"]>;

export const PLATFORMS: Record<
  Platform,
  { label: string; icon: IconType; badge: string }
> = {
  FACEBOOK: {
    label: "Facebook",
    icon: FaFacebookF,
    badge: "text-[#1877F2] bg-[#1877F2]/10 ring-[#1877F2]/25",
  },
  INSTAGRAM: {
    label: "Instagram",
    icon: FaInstagram,
    badge: "text-[#C13584] bg-[#C13584]/10 ring-[#C13584]/25",
  },
  LINKEDIN: {
    label: "LinkedIn",
    icon: FaLinkedinIn,
    badge: "text-[#0A66C2] bg-[#0A66C2]/10 ring-[#0A66C2]/25",
  },
  YOUTUBE: {
    label: "YouTube",
    icon: FaYoutube,
    badge: "text-[#FF0000] bg-[#FF0000]/10 ring-[#FF0000]/25",
  },
};

export const PlatformRedirectColumns = (
  handleEdit: (data: IHomeContent) => void,
): ColumnDef<IHomeContent>[] => [
  {
    accessorKey: "platformName",
    header: "Platform",
    enableSorting: false,
    cell: ({ row }) => {
      const item = row.original;
      const platform = item.platformType ? PLATFORMS[item.platformType] : null;
      const name = item.platformName || platform?.label || "Unnamed platform";

      return (
        <div className="flex min-w-[220px] items-center gap-3">
          {/* The uploaded icon is what the home page shows. */}
          <Thumbnail
            src={item.image}
            alt={`${name} icon`}
            fallback={<Share2 className="h-5 w-5 text-neutralPrimary-300" />}
          />
          <div className="flex min-w-0 flex-col gap-1">
            <span className="truncate text-sm font-medium text-neutralPrimary-800">
              {name}
            </span>
            {platform ? (
              <span className={`${BADGE_BASE} ${platform.badge}`}>
                <platform.icon className="h-3 w-3" />
                {platform.label}
              </span>
            ) : (
              <span className="text-xs text-neutralPrimary-400">
                No platform type
              </span>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "redirectUrl",
    header: "Opens",
    enableSorting: false,
    cell: ({ row }) => (
      <LinkCell
        url={row.original.redirectUrl}
        emptyTitle="No link set: the icon goes nowhere"
      />
    ),
  },
  {
    accessorKey: "sortOrder",
    header: "Position",
    enableSorting: false,
    cell: ({ row }) => <PositionCell sortOrder={row.original.sortOrder} />,
  },
  {
    accessorKey: "status",
    header: "Status",
    enableSorting: false,
    cell: ({ row }) => <StatusCell status={row.original.status} />,
  },
  {
    accessorKey: "updatedAt",
    header: "Last Updated",
    enableSorting: false,
    cell: ({ row }) => <UpdatedCell item={row.original} />,
  },
  {
    accessorKey: "actions",
    header: "Action",
    enableSorting: false,
    cell: ({ row }) => <ActionsCell item={row.original} onEdit={handleEdit} />,
  },
];
