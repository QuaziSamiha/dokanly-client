import { ColumnDef } from "@tanstack/react-table";
import { Film, ImageIcon, Link2, PlayCircle, Sparkles } from "lucide-react";
import { FaYoutube } from "react-icons/fa";
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

type OvcMedia = "VIDEO_FILE" | "VIDEO_LINK" | "GIF" | "IMAGE";

const OVC_MEDIA: Record<
  OvcMedia,
  { label: string; badge: string; icon: typeof Film }
> = {
  VIDEO_FILE: {
    label: "Video file",
    badge: "text-violet-700 bg-violet-50 ring-violet-600/20",
    icon: Film,
  },
  VIDEO_LINK: {
    label: "Video link",
    badge: "text-sky-700 bg-sky-50 ring-sky-600/20",
    icon: Link2,
  },
  GIF: {
    label: "GIF",
    badge: "text-pink-700 bg-pink-50 ring-pink-600/20",
    icon: Sparkles,
  },
  IMAGE: {
    label: "Image",
    badge: "text-emerald-700 bg-emerald-50 ring-emerald-600/20",
    icon: ImageIcon,
  },
};

/**
 * An OVC holds exactly one media item. An uploaded video keeps its original
 * file name in `title`; a pasted link has no title.
 */
const mediaOf = (item: IHomeContent): OvcMedia | null => {
  if (item.image) return /\.gif(\?|$)/i.test(item.image) ? "GIF" : "IMAGE";
  if (item.videoUrl) return item.title ? "VIDEO_FILE" : "VIDEO_LINK";
  return null;
};

const isYouTube = (url?: string | null) =>
  !!url && /(?:youtube\.com|youtu\.be)/i.test(url);

export const OvcColumns = (
  handleEdit: (data: IHomeContent) => void,
  handleDelete: (data: IHomeContent) => void,
): ColumnDef<IHomeContent>[] => [
  {
    accessorKey: "media",
    header: "Media",
    enableSorting: false,
    cell: ({ row }) => {
      const item = row.original;
      const media = mediaOf(item);
      const config = media ? OVC_MEDIA[media] : null;

      const preview =
        media === "VIDEO_FILE" ? (
          // * The first frame of the uploaded video, without downloading it all.
          <div className="relative h-12 w-24 shrink-0 overflow-hidden rounded-md border border-neutralPrimary-200 bg-neutralPrimary-900">
            <video
              src={item.videoUrl}
              muted
              preload="metadata"
              className="h-full w-full object-cover opacity-80"
            />
            <PlayCircle className="absolute inset-0 m-auto h-5 w-5 text-white drop-shadow" />
          </div>
        ) : (
          <Thumbnail
            src={item.image}
            alt="OVC media"
            wide
            fallback={
              isYouTube(item.videoUrl) ? (
                <FaYoutube className="h-6 w-6 text-[#FF0000]" />
              ) : (
                <PlayCircle className="h-6 w-6 text-neutralPrimary-400" />
              )
            }
          />
        );

      const caption =
        media === "VIDEO_FILE"
          ? item.title
          : media === "VIDEO_LINK"
            ? item.videoUrl
            : null;

      return (
        <div className="flex min-w-[280px] items-center gap-3">
          {preview}
          <div className="flex min-w-0 flex-col gap-1">
            {config ? (
              <span className={`${BADGE_BASE} ${config.badge}`}>
                <config.icon className="h-3 w-3" />
                {config.label}
              </span>
            ) : (
              <span className="text-sm text-neutralPrimary-400">No media</span>
            )}
            {caption &&
              (media === "VIDEO_LINK" ? (
                <a
                  href={caption}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={caption}
                  className="max-w-[200px] truncate text-xs text-neutralPrimary-500 hover:text-greenPrimary-600 hover:underline"
                >
                  {caption}
                </a>
              ) : (
                <span
                  className="max-w-[200px] truncate text-xs text-neutralPrimary-500"
                  title={caption}
                >
                  {caption}
                </span>
              ))}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "redirectUrl",
    header: "Opens",
    enableSorting: false,
    cell: ({ row }) => <LinkCell url={row.original.redirectUrl} />,
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
    cell: ({ row }) => (
      <ActionsCell
        item={row.original}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    ),
  },
];
