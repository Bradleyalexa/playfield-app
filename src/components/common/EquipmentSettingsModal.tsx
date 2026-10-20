"use client";

import { useState } from "react";
import { X, Flame, Package, Check, Plus, Minus, Settings2 } from "lucide-react";
import {
  EquipmentConfig,
  EquipmentPricingModel,
  SportType,
  calculateEquipmentCost,
} from "../../core/entities/session";
import { formatRupiah } from "../../lib/utils";

interface EquipmentSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipment: EquipmentConfig;
  sport: SportType;
  onSave: (updated: EquipmentConfig) => void;
}

export function EquipmentSettingsModal({
  isOpen,
  onClose,
  equipment,
  sport,
  onSave,
}: EquipmentSettingsModalProps) {
  const [pricingModel, setPricingModel] = useState<EquipmentPricingModel>(
    equipment.pricingModel || "per_unit"
  );
  const [costPerUnit, setCostPerUnit] = useState<number>(equipment.costPerUnit || 12000);
  const [costPerSlop, setCostPerSlop] = useState<number>(equipment.costPerSlop || 140000);
  const [unitsPerSlop, setUnitsPerSlop] = useState<number>(equipment.unitsPerSlop || 12);
  const [totalUsed, setTotalUsed] = useState<number>(equipment.totalUsed || 0);
  const [slopUsed, setSlopUsed] = useState<number>(
    equipment.slopUsed ?? (equipment.pricingModel === "per_slop" ? 1 : 0)
  );

  if (!isOpen) return null;

  const currentPreviewEquipment: EquipmentConfig = {
    ...equipment,
    pricingModel,
    costPerUnit,
    costPerSlop,
    unitsPerSlop,
    totalUsed,
    slopUsed,
  };

  const currentTotalCost = calculateEquipmentCost(currentPreviewEquipment);

  const handleSave = () => {
    onSave(currentPreviewEquipment);
    onClose();
  };

  const isBadminton = sport === "badminton";
  const unitLabel = isBadminton ? "Shuttlecock" : "Bola";
  const slopLabel = isBadminton ? "Slop (Tabung)" : "Can (Kaleng)";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-3xl border-4 border-black bg-white p-6 shadow-[8px_8px_0px_#000]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between pb-3 border-b-3 border-black">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ffde00] text-black border-2 border-black shadow-[2px_2px_0px_#000]">
              <Settings2 className="h-5 w-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-black text-black uppercase tracking-wide">
                Pengaturan Biaya {unitLabel} & {slopLabel}
              </h3>
              <p className="text-xs font-bold text-slate-600">
                Ubah model hitungan atau sesuaikan harga kapan saja
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-black hover:bg-slate-100 border-2 border-black transition-colors cursor-pointer"
          >
            <X className="h-5 w-5 stroke-[3]" />
          </button>
        </div>

        {/* Body Form */}
        <div className="my-5 space-y-4">
          {/* Pilihan Model: Per Butir vs Per Slop */}
          <div>
            <label className="block text-[11px] font-black uppercase text-black/70 mb-2">
              Model Perhitungan Biaya:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPricingModel("per_unit")}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border-2 border-black font-black text-xs uppercase tracking-wide transition-all cursor-pointer ${
                  pricingModel === "per_unit"
                    ? "bg-[#ccff00] text-black shadow-[3px_3px_0px_#000] -translate-y-0.5"
                    : "bg-[#faf8f2] text-black hover:bg-slate-50"
                }`}
              >
                <Flame className="h-4 w-4 fill-black" />
                <span>Hitung Per Butir</span>
              </button>

              <button
                type="button"
                onClick={() => setPricingModel("per_slop")}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border-2 border-black font-black text-xs uppercase tracking-wide transition-all cursor-pointer ${
                  pricingModel === "per_slop"
                    ? "bg-[#ccff00] text-black shadow-[3px_3px_0px_#000] -translate-y-0.5"
                    : "bg-[#faf8f2] text-black hover:bg-slate-50"
                }`}
              >
                <Package className="h-4 w-4" />
                <span>Hitung Per {isBadminton ? "Slop" : "Can"}</span>
              </button>
            </div>
          </div>

          {/* Form Sesuai Model */}
          {pricingModel === "per_unit" ? (
            <div className="p-4 rounded-2xl bg-[#faf8f2] border-2 border-black shadow-[2px_2px_0px_#000] space-y-3">
              <div>
                <label className="text-[11px] font-black uppercase text-black block mb-1">
                  Harga Per Butir {unitLabel} (Rp):
                </label>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-sm">Rp</span>
                  <input
                    type="number"
                    step="500"
                    min="0"
                    value={costPerUnit}
                    onChange={(e) => setCostPerUnit(Math.max(0, parseInt(e.target.value, 10) || 0))}
                    className="flex-1 rounded-xl bg-white border-2 border-black px-3 py-1.5 font-mono font-black text-sm text-black"
                  />
                </div>
              </div>

              {/* Presets Cepat */}
              <div className="flex flex-wrap items-center gap-1.5">
                {[10000, 12000, 15000, 20000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setCostPerUnit(val)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-black border transition-all cursor-pointer ${
                      costPerUnit === val
                        ? "bg-black text-[#ccff00] border-black"
                        : "bg-white text-black border-black/40 hover:border-black"
                    }`}
                  >
                    Rp {val.toLocaleString("id-ID")}
                  </button>
                ))}
              </div>

              {/* Adjust Pemakaian Saat Ini */}
              <div className="pt-2 border-t border-black/15 flex items-center justify-between">
                <div>
                  <span className="text-xs font-black text-black block">Total {unitLabel} Terpakai:</span>
                  <span className="text-[10px] text-slate-600 font-bold">
                    Setara ~{Math.ceil(totalUsed / 12)} slop
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setTotalUsed(Math.max(0, totalUsed - 1))}
                    className="h-8 w-8 rounded-lg bg-white border-2 border-black flex items-center justify-center font-black hover:bg-slate-100 cursor-pointer"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="font-mono font-black text-base w-8 text-center">{totalUsed}</span>
                  <button
                    type="button"
                    onClick={() => setTotalUsed(totalUsed + 1)}
                    className="h-8 w-8 rounded-lg bg-[#ccff00] border-2 border-black flex items-center justify-center font-black hover:bg-[#b8e600] cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-[#faf8f2] border-2 border-black shadow-[2px_2px_0px_#000] space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-black uppercase text-black block mb-1">
                    Harga Per {isBadminton ? "Slop" : "Can"} (Rp):
                  </label>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-black text-xs">Rp</span>
                    <input
                      type="number"
                      step="5000"
                      min="0"
                      value={costPerSlop}
                      onChange={(e) => setCostPerSlop(Math.max(0, parseInt(e.target.value, 10) || 0))}
                      className="w-full rounded-xl bg-white border-2 border-black px-3 py-1.5 font-mono font-black text-sm text-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-black uppercase text-black block mb-1">
                    Isi Butir Per {isBadminton ? "Slop" : "Can"}:
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="24"
                    value={unitsPerSlop}
                    onChange={(e) => setUnitsPerSlop(Math.max(1, parseInt(e.target.value, 10) || 12))}
                    className="w-full rounded-xl bg-white border-2 border-black px-3 py-1.5 font-mono font-black text-sm text-black"
                  />
                </div>
              </div>

              {/* Quick Slop Presets */}
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { label: "120rb", val: 120000 },
                  { label: "140rb", val: 140000 },
                  { label: "160rb", val: 160000 },
                  { label: "290rb", val: 290000 },
                ].map((item) => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => setCostPerSlop(item.val)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-black border transition-all cursor-pointer ${
                      costPerSlop === item.val
                        ? "bg-black text-[#ccff00] border-black"
                        : "bg-white text-black border-black/40 hover:border-black"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Adjust Slop Terbuka */}
              <div className="pt-2 border-t border-black/15 flex items-center justify-between">
                <div>
                  <span className="text-xs font-black text-black block">
                    Jumlah {isBadminton ? "Slop" : "Can"} Dibuka:
                  </span>
                  <span className="text-[10px] text-slate-600 font-bold">
                    Kapasitas {slopUsed * unitsPerSlop} butir ({totalUsed} butir terpakai)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSlopUsed(Math.max(0, slopUsed - 1))}
                    className="h-8 w-8 rounded-lg bg-white border-2 border-black flex items-center justify-center font-black hover:bg-slate-100 cursor-pointer"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="font-mono font-black text-base w-8 text-center">{slopUsed}</span>
                  <button
                    type="button"
                    onClick={() => setSlopUsed(slopUsed + 1)}
                    className="h-8 w-8 rounded-lg bg-[#ccff00] border-2 border-black flex items-center justify-center font-black hover:bg-[#b8e600] cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Live Total Biaya Preview */}
          <div className="p-4 rounded-2xl bg-[#ffde00] border-3 border-black shadow-[3px_3px_0px_#000] flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono font-black uppercase text-black/60 block">
                Total Tagihan {unitLabel}:
              </span>
              <span className="text-xs font-bold text-black">
                {pricingModel === "per_slop"
                  ? `${slopUsed} ${isBadminton ? "Slop" : "Can"} × ${formatRupiah(costPerSlop)}`
                  : `${totalUsed} Butir × ${formatRupiah(costPerUnit)}`}
              </span>
            </div>
            <span className="font-mono font-black text-2xl text-black">
              {formatRupiah(currentTotalCost)}
            </span>
          </div>
        </div>

        {/* Footer Modal */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t-2 border-black">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border-2 border-black bg-white text-xs font-black uppercase tracking-wider hover:bg-slate-100 cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl border-2 border-black bg-[#ccff00] text-black text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_#000] hover:bg-[#b8e600] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
          >
            <Check className="h-4 w-4 stroke-[3]" />
            <span>Simpan Pengaturan</span>
          </button>
        </div>
      </div>
    </div>
  );
}
