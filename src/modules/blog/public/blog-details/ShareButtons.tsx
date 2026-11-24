"use client";

import React, { useEffect, useState } from "react";
import { Check, Link2, Share2 } from "lucide-react";
import {
  FaFacebookF,
  FaLinkedinIn,
  FaWhatsapp,
  FaXTwitter,
} from "react-icons/fa6";
import { toast } from "sonner";

interface IShareButtonsProps {
  title: string;
  path: string;
  /** Vertical stack for the sticky desktop sidebar. */
  vertical?: boolean;
}

const BUTTON =
  "flex h-10 w-10 items-center justify-center rounded-full border border-neutralPrimary-200 bg-white text-neutralPrimary-600 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-95";

export default function ShareButtons({
  title,
  path,
  vertical = false,
}: IShareButtonsProps) {
  // The origin is only known in the browser; building the URL after mount
  // keeps the server and client markup identical.
  const [url, setUrl] = useState("");
  const [canShare, setCanShare] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setUrl(`${window.location.origin}${path}`);
    setCanShare(typeof navigator.share === "function");
  }, [path]);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const networks = [
    {
      label: "Share on Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      icon: <FaFacebookF size={15} />,
      hover: "hover:border-[#1877F2] hover:bg-[#1877F2] hover:text-white",
    },
    {
      label: "Share on WhatsApp",
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      icon: <FaWhatsapp size={17} />,
      hover: "hover:border-[#25D366] hover:bg-[#25D366] hover:text-white",
    },
    {
      label: "Share on X",
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      icon: <FaXTwitter size={15} />,
      hover: "hover:border-black hover:bg-black hover:text-white",
    },
    {
      label: "Share on LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      icon: <FaLinkedinIn size={15} />,
      hover: "hover:border-[#0A66C2] hover:bg-[#0A66C2] hover:text-white",
    },
  ];

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy the link");
    }
  };

  const nativeShare = async () => {
    try {
      await navigator.share({ title, url });
    } catch {
      // The visitor closed the share sheet — nothing to do.
    }
  };

  return (
    <div
      className={`flex items-center gap-2 ${vertical ? "flex-col" : "flex-wrap"}`}
    >
      {/* Phones get the system share sheet first: it reaches every app. */}
      {canShare && (
        <button
          type="button"
          onClick={nativeShare}
          aria-label="Share"
          title="Share"
          className={`${BUTTON} hover:border-greenPrimary-500 hover:bg-greenPrimary-500 hover:text-white lg:hidden`}
        >
          <Share2 size={16} />
        </button>
      )}
      {networks.map((network) => (
        <a
          key={network.label}
          href={url ? network.href : undefined}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={network.label}
          title={network.label}
          className={`${BUTTON} ${network.hover}`}
        >
          {network.icon}
        </a>
      ))}
      <button
        type="button"
        onClick={copyLink}
        aria-label="Copy link"
        title="Copy link"
        className={`${BUTTON} hover:border-greenPrimary-500 hover:bg-greenPrimary-500 hover:text-white`}
      >
        {copied ? <Check size={16} /> : <Link2 size={16} />}
      </button>
    </div>
  );
}
