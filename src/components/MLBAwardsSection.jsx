import { mlbAwardsConfig } from "../data/mlbAwards";

function MLBAwardsSection({ awardsData, onAwardChange }) {
  return (
    <section className="rounded-2xl border border-[#1DCD9F] bg-[#222222] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
      <h2 className="mb-4 text-2xl font-bold text-white">MLB Awards</h2>

      <div className="space-y-6">
        {mlbAwardsConfig.map((award) => (
          <div
            key={award.key}
            className="rounded-xl border border-[#1DCD9F]/25 bg-black/40 p-4"
          >
            <h3 className="mb-3 text-lg font-semibold text-white">
              {award.label}
            </h3>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {Array.from({ length: award.slots }).map((_, index) => (
                <div key={index}>
                  <label className="mb-1 block text-sm font-medium text-slate-200">
                    {award.slots === 1 ? "Pick" : `Pick ${index + 1}`}
                  </label>
                  <input
                    type="text"
                    value={awardsData[award.key]?.[index] || ""}
                    onChange={(e) =>
                      onAwardChange(award.key, index, e.target.value)
                    }
                    placeholder="Optional"
                    className="w-full rounded-xl border border-[#1DCD9F]/30 bg-black px-3 py-2 text-white outline-none transition placeholder:text-slate-500 focus:border-[#1DCD9F]"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default MLBAwardsSection;
