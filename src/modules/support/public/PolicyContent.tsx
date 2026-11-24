// * Typography for policy HTML. Used by the storefront pages and the admin
// * preview so both render the content the same way.
const policyContentClass = [
  "rich-text-container break-words text-[15px] leading-7 text-neutral-700 md:text-base",
  "[&_p]:mb-4",
  "[&_strong]:font-semibold [&_strong]:text-neutralPrimary-800",
  "[&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:scroll-mt-32 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-neutralPrimary-800 md:[&_h2]:text-xl",
  "[&_h2:first-child]:mt-0",
  "[&_ul]:mb-5 [&_ol]:mb-5 [&_li]:mb-2 [&_li]:pl-1 [&_li]:marker:text-greenPrimary-500",
].join(" ");

export default function PolicyContent({ html }: { html: string }) {
  return (
    <div
      className={policyContentClass}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
