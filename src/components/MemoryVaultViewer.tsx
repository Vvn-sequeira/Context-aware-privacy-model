import React from 'react';
import { MemoryVaultState, Role } from '../types/jev';
import { Database, ShieldCheck, Cpu, HardDrive, Trash2 } from 'lucide-react';

interface MemoryVaultViewerProps {
  vaultState: MemoryVaultState | null;
  role: Role;
}

export const MemoryVaultViewer: React.FC<MemoryVaultViewerProps> = ({
  vaultState,
  role,
}) => {
  if (!vaultState || vaultState.items.length === 0) {
    return (
      <div className="bg-white border border-[#e5e2da] rounded-xl p-8 text-center text-[#706c62]">
        <Database className="w-8 h-8 mx-auto mb-3 text-[#b45309] stroke-[1.5]" />
        <h3 className="font-serif text-base font-semibold text-[#1a1915]">
          Ephemeral Memory Vault is Idle
        </h3>
        <p className="text-xs text-[#706c62] max-w-md mx-auto mt-1">
          Run an inquiry through the Two-Gate Pipeline to observe how sensitive entities are
          isolated in volatile RAM and replaced with safe token handles before LLM dispatch.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#e5e2da] rounded-xl overflow-hidden shadow-xs">
      {/* Header telemetry strip */}
      <div className="bg-[#faf9f5] border-b border-[#e5e2da] px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-lg font-semibold text-[#1a1915]">
              Ephemeral In-Memory Vault
            </h2>
            <span className="text-[11px] font-mono text-[#226738] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              VOLATILE RAM ALLOCATION
            </span>
          </div>
          <p className="text-xs text-[#66635a] mt-0.5">
            Per-request quarantine buffer. Zero persistence on disk or database. Destroyed on completion.
          </p>
        </div>

        {/* Memory Stats */}
        <div className="flex items-center gap-6 text-xs font-mono">
          <div>
            <span className="text-[#8c887e] block text-[10px] uppercase">Allocated Heap</span>
            <span className="text-[#1a1915] font-semibold tabular-nums">
              {vaultState.totalAllocatedBytes} bytes
            </span>
          </div>

          <div>
            <span className="text-[#8c887e] block text-[10px] uppercase">Quarantined Entities</span>
            <span className="text-[#1a1915] font-semibold tabular-nums">
              {vaultState.items.length} items
            </span>
          </div>

          <div>
            <span className="text-[#8c887e] block text-[10px] uppercase">Disk Persistence</span>
            <span className="text-emerald-700 font-semibold">0% (NEVER WRITTEN)</span>
          </div>
        </div>
      </div>

      {/* Vault Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#e5e2da] bg-[#fbfaf7] text-[#706c62] font-mono uppercase text-[11px]">
              <th className="py-2.5 px-4 font-medium">Memory Address</th>
              <th className="py-2.5 px-4 font-medium">Token Handle</th>
              <th className="py-2.5 px-4 font-medium">Quarantined Raw Text (In RAM)</th>
              <th className="py-2.5 px-4 font-medium">Category</th>
              <th className="py-2.5 px-4 font-medium">Gate 1 Policy</th>
              <th className="py-2.5 px-4 font-medium">Rehydration Status ({role})</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f0ede6]">
            {vaultState.items.map((item) => {
              const isAllowed = item.action === 'ALLOW';
              const isMasked = item.action === 'MASK';
              const isBlocked = item.action === 'BLOCK';

              return (
                <tr key={item.id} className="hover:bg-[#faf9f5] transition-colors">
                  {/* Memory address */}
                  <td className="py-3 px-4 font-mono text-[11px] text-[#706c62]">
                    <div className="flex items-center gap-1.5">
                      <Cpu className="w-3 h-3 text-[#b45309]" />
                      <span>{item.memoryAddress}</span>
                    </div>
                  </td>

                  {/* Token */}
                  <td className="py-3 px-4 font-mono font-medium text-[#1a1915]">
                    <span className="bg-[#f0ede6] text-[#33312c] px-2 py-0.5 rounded text-[11px]">
                      {item.token}
                    </span>
                  </td>

                  {/* Quarantined Raw Value in RAM */}
                  <td className="py-3 px-4 font-mono text-[#1a1915]">
                    <div className="flex items-center gap-2">
                      <span className="font-medium bg-amber-50 text-amber-950 px-2 py-0.5 rounded border border-amber-200">
                        {item.value}
                      </span>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3 px-4 font-mono text-[11px] uppercase text-[#706c62]">
                    {item.category}
                  </td>

                  {/* Action */}
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block font-mono text-[11px] font-semibold px-2 py-0.5 rounded ${
                        isAllowed
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : isMasked
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {item.action}
                    </span>
                  </td>

                  {/* Rehydration Rule for current viewer */}
                  <td className="py-3 px-4">
                    {isAllowed ? (
                      <span className="text-emerald-700 font-medium flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Visible to {role}</span>
                      </span>
                    ) : isMasked ? (
                      <span className="text-amber-800 flex items-center gap-1">
                        <span>Masked as {item.token}</span>
                      </span>
                    ) : (
                      <span className="text-rose-700 flex items-center gap-1">
                        <span>Removed [withheld]</span>
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Architecture Affirmation Box */}
      <div className="bg-[#faf9f5] border-t border-[#e5e2da] p-4 text-xs text-[#66635a] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-[#8c887e]" />
          <span>
            <strong className="text-[#1a1915]">JEV Core Principle: </strong>
            The Main LLM never receives what it must not see. Raw values remain quarantined in volatile RAM; only token handles are transmitted over the network.
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#8c887e]">
          <Trash2 className="w-3.5 h-3.5 text-rose-600" />
          <span>HEAP TTL: EPHEMERAL REQUEST LIFECYCLE</span>
        </div>
      </div>
    </div>
  );
};
