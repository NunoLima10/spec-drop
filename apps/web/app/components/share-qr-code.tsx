import { useEffect, useState } from "react";

type ShareQrCodeProps = {
  className?: string;
  url: string;
};

export async function generateShareQrSvg(url: string) {
  const normalizedUrl = normalizeShareUrl(url);

  if (!normalizedUrl) {
    return "";
  }

  const QRCode = await import("qrcode");

  return QRCode.default.toString(normalizedUrl, {
    errorCorrectionLevel: "M",
    margin: 2,
    type: "svg",
  });
}

export function ShareQrCode({ className = "", url }: ShareQrCodeProps) {
  const [svg, setSvg] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">(
    "idle",
  );

  useEffect(() => {
    let isCurrent = true;

    async function generateQrCode() {
      setStatus("loading");
      setSvg("");

      try {
        const nextSvg = await generateShareQrSvg(url);

        if (!isCurrent) {
          return;
        }

        if (!nextSvg) {
          setStatus("idle");
          return;
        }

        setSvg(nextSvg);
        setStatus("ready");
      } catch {
        if (isCurrent) {
          setStatus("error");
        }
      }
    }

    generateQrCode();

    return () => {
      isCurrent = false;
    };
  }, [url]);

  if (status === "error") {
    return (
      <div
        className={`flex size-full items-center justify-center rounded-lg border border-red-400/20 bg-red-500/10 p-4 text-center text-red-100 text-sm ${className}`}
        role="status"
      >
        QR unavailable
      </div>
    );
  }

  if (status !== "ready") {
    return (
      <div
        aria-label="Generating QR code"
        className={`grid size-full grid-cols-5 grid-rows-5 gap-2 ${className}`}
        role="status"
      >
        {Array.from({ length: 25 }).map((_, index) => (
          <span
            className={
              qrLoadingBlocks.has(index)
                ? "animate-pulse rounded-sm bg-[#d8ecf8]"
                : "rounded-sm bg-[#151827]"
            }
            key={index}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      aria-label={`QR code for ${url}`}
      className={`share-qr-code size-full [&_svg]:size-full ${className}`}
      dangerouslySetInnerHTML={{ __html: svg }}
      role="img"
    />
  );
}

function normalizeShareUrl(url: string) {
  const trimmedUrl = url.trim();

  if (!trimmedUrl) {
    return "";
  }

  try {
    return new URL(trimmedUrl).toString();
  } catch {
    return "";
  }
}

const qrLoadingBlocks = new Set([
  0, 1, 2, 4, 5, 7, 9, 10, 12, 14, 15, 16, 18, 20, 22, 23, 24,
]);
