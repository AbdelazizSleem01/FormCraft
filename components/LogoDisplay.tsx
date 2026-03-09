"use client";

import { useEffect, useState } from "react";
import { Globe } from "lucide-react";
import { extractDomain, getLogoUrl, getFaviconUrl, isDirectImageUrl } from "@/lib/utils";
import Image from "next/image";

interface LogoDisplayProps {
  url: string;
  size?: "sm" | "md" | "lg";
  showDomain?: boolean;
  showName?: boolean;
}

export default function LogoDisplay({ url, size = "lg", showDomain = true, showName = false }: LogoDisplayProps) {
  const [logoFailed, setLogoFailed] = useState(false);
  const [faviconFailed, setFaviconFailed] = useState(false);

  if (!url) return null;

  const domain = extractDomain(url);
  const isImageUrl = isDirectImageUrl(url);
  const logoSrc = isImageUrl ? (url.startsWith("http") ? url : `https://${url}`) : getLogoUrl(domain);
  const faviconSrc = getFaviconUrl(domain);

  useEffect(() => {
    setLogoFailed(false);
    setFaviconFailed(false);
  }, [domain]);

  const sizes = {
    sm: { container: "w-10 h-10", fallback: 12 },
    md: { container: "w-9 h-9", fallback: 16 },
    lg: { container: "w-12 h-12", fallback: 20 },
  };

  const { container, fallback } = sizes[size];

  return (
    <div className="flex items-center gap-2">
      <div
        className={`${container} rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden`}
        style={{ background: "var(--surface-overlay)", border: "1px solid var(--border)" }}
      >
        {!logoFailed ? (

          <Image
            src={logoSrc}
            alt={domain}
            width={44}
            height={44}
            className="w-full h-full object-contain p-1 rounded-lg"
            onError={() => setLogoFailed(true)}
          />
        ) : !faviconFailed ? (

          <Image
            src={faviconSrc}
            alt={domain}
            width={8}
            height={8}
            className="w-full h-full object-contain p-0.5 rounded-lg"
            onError={() => setFaviconFailed(true)}
          />
        ) : (
          <Globe size={fallback} style={{ color: "var(--text-muted)" }} />
        )}
      </div>

      {(showDomain || showName) && (
        <div className="flex flex-col min-w-0">
          {showDomain && (
            <span
              className="text-xs font-medium truncate"
              style={{ color: "var(--text-secondary)", fontFamily: "'DM Mono', monospace" }}
            >
              {domain}
            </span>
          )}
          {showName && (
            <a
              href={url.startsWith("http") ? url : `https://${url}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs hover:underline truncate"
              style={{ color: "var(--accent-soft)" }}
            >
              Visit ↗
            </a>
          )}
        </div>
      )}
    </div>
  );
}
