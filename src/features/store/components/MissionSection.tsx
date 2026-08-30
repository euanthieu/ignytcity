const MAIN_VERSE = {
  text: "You are the world's light—a city on a hill, glowing in the night for all to see.",
  reference: "Matthew 5:14 (TLB)",
};

export function MissionSection() {
  return (
    <section id="vision-mission" className="py-16 sm:py-[64px]">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8">
        {MAIN_VERSE.text && (
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <p className="ic-display text-[22px] sm:text-[28px] leading-[1.3] text-[#151515] dark:text-[#f5f2ee] italic">
              &ldquo;{MAIN_VERSE.text}&rdquo;
            </p>
            <p className="ic-mono text-[11px] tracking-[2px] text-[#151515]/50 dark:text-[#f5f2ee]/50 mt-4">
              {MAIN_VERSE.reference}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <p className="ic-mono text-[10px] tracking-[3px] text-[#151515]/60 dark:text-[#f5f2ee]/60 mb-3">
              Vision
            </p>
            <p className="ic-mono text-[13px] normal-case tracking-normal text-[#151515]/80 dark:text-[#f5f2ee]/80 leading-relaxed">
              Our vision is to ignite a fire so bright that other generations
              can see, raising a generation that shines.
            </p>
          </div>
          <div>
            <p className="ic-mono text-[10px] tracking-[3px] text-[#151515]/60 dark:text-[#f5f2ee]/60 mb-3">
              Mission
            </p>
            <p className="ic-mono text-[13px] normal-case tracking-normal text-[#151515]/80 dark:text-[#f5f2ee]/80 leading-relaxed">
              Our mission is to gather the youth of Baguio into God&apos;s
              presence, equip them with His Word, ignite their hearts through
              worship, and send them out to shine the light of Jesus throughout
              the city.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
