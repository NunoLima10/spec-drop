const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="12" fill="#0f172a"/>
  <path d="M18 14h20l8 8v28H18z" fill="#f8fafc"/>
  <path d="M38 14v10h8" fill="#cbd5e1"/>
  <path d="M24 32h16M24 39h16M24 46h10" stroke="#0f172a" stroke-width="4" stroke-linecap="round"/>
</svg>`;

export function loader() {
  return new Response(favicon, {
    headers: {
      "Cache-Control": "public, max-age=86400",
      "Content-Type": "image/svg+xml",
    },
  });
}
