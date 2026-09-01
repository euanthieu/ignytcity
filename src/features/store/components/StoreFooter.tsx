const COLUMNS = [
  {
    title: "Explore",
    links: [
      { label: "Shop the Drop", href: "#drop" },
      { label: "Size Guide", href: "#size-guide" },
      { label: "How to Order", href: "#how-to-order" },
    ],
  },
  {
    title: "Customer Care",
    links: [
      { label: "Payment via GCash", href: "#how-to-order" },
      { label: "Payment via BDO", href: "#how-to-order" },
      { label: "Call/Text 0995 080 8552", href: "tel:+639950808552" },
    ],
  },
  {
    title: "Follow",
    links: [
      {
        label: "Instagram @yth.ignyt",
        href: "https://instagram.com/yth.ignyt",
      },
      { label: "Facebook @yth.ignyt", href: "https://facebook.com/yth.ignyt" },
    ],
  },
];

export function StoreFooter() {
  return (
    <footer className="bg-[#24170f] pt-16 pb-10">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-10 pb-12">
          <div className="col-span-2 sm:col-span-1">
            <p className="ic-display text-[16px] tracking-[1.6px] text-[#ffffff] mb-4">
              Ignyt City
            </p>
            <p className="ic-mono text-[11px] normal-case tracking-normal text-[#ffffff]/60 leading-relaxed max-w-[220px]">
              Igniting a generation to outshine the darkness.
            </p>
            <p className="ic-mono text-[10px] normal-case tracking-normal text-[#ffffff]/40 leading-relaxed max-w-[220px] mt-4">
              No shipping — pickup only at the 5th Floor, CAP Building.
              Questions? DM us on Instagram/Facebook @yth.ignyt or call/text
              0995 080 8552.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="ic-display text-[16px] tracking-[1.6px] text-[#ffffff] mb-4">
                {col.title}
              </p>
              <ul className="flex flex-col gap-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target={
                        link.href.startsWith("http") ? "_blank" : undefined
                      }
                      rel={
                        link.href.startsWith("http") ? "noreferrer" : undefined
                      }
                      className="ic-mono text-[12px] normal-case tracking-normal text-[#ffffff]/60 hover:text-[#ffffff] transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-[#ffffff]/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="ic-mono text-[10px] text-[#ffffff]/40">
            &copy; {new Date().getFullYear()} Ignyt City. All rights reserved.
          </p>
          <p className="ic-mono text-[10px] text-[#ffffff]/40">
            2600 &middot; Ignyt City 09.11.26
          </p>
        </div>
      </div>
    </footer>
  );
}
