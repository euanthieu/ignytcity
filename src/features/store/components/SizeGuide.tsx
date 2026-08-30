import { SIZE_CHART } from "../data/products";

export function SizeGuide() {
  return (
    <section id="size-guide" className="bg-[#24170f] py-16 sm:py-[64px]">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8 grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        <div>
          <p className="ic-mono text-[10px] tracking-[3px] text-[#ffffff]/60 mb-3">
            Fit &amp; Fabric
          </p>
          <h2 className="ic-display text-[32px] sm:text-[40px] tracking-[3px] text-[#ffffff] mb-6">
            Size Guide
          </h2>
          <ul className="flex flex-col gap-2">
            {SIZE_CHART.fabric.map((line) => (
              <li
                key={line}
                className="ic-mono text-[12px] normal-case tracking-normal text-[#ffffff]/75"
              >
                {line}
              </li>
            ))}
          </ul>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[#ffffff]/30">
                <th className="ic-mono text-[10px] text-left text-[#ffffff]/60 py-3 pr-4">
                  Size
                </th>
                <th className="ic-mono text-[10px] text-left text-[#ffffff]/60 py-3 pr-4">
                  Width ({SIZE_CHART.unit})
                </th>
                <th className="ic-mono text-[10px] text-left text-[#ffffff]/60 py-3 pr-4">
                  Length ({SIZE_CHART.unit})
                </th>
                <th className="ic-mono text-[10px] text-left text-[#ffffff]/60 py-3">
                  Sleeves ({SIZE_CHART.unit})
                </th>
              </tr>
            </thead>
            <tbody>
              {SIZE_CHART.rows.map((row) => (
                <tr key={row.size} className="border-b border-[#ffffff]/10">
                  <td className="ic-mono text-[13px] text-[#ffffff] py-3 pr-4">
                    {row.size}
                  </td>
                  <td className="ic-mono text-[13px] text-[#ffffff]/80 py-3 pr-4">
                    {row.width}
                  </td>
                  <td className="ic-mono text-[13px] text-[#ffffff]/80 py-3 pr-4">
                    {row.length}
                  </td>
                  <td className="ic-mono text-[13px] text-[#ffffff]/80 py-3">
                    {row.sleeves}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
