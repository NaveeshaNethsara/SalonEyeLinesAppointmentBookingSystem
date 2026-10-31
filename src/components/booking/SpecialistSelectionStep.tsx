import Image from "next/image";
import { SpecialistItem } from "@/types";

interface SpecialistSelectionStepProps {
  specialistsList: SpecialistItem[];
  selectedStaff: SpecialistItem | null;
  onSelectStaff: (staff: SpecialistItem) => void;
}

export default function SpecialistSelectionStep({
  specialistsList,
  selectedStaff,
  onSelectStaff
}: SpecialistSelectionStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-3xl font-light text-stone-900">
          2. Choose Your Beauty Specialist
        </h2>
        <p className="text-xs text-stone-500 mt-1">
          Choose a specific stylist or any senior expert for immediate availability.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {specialistsList.map((spec) => {
          const isSelected = selectedStaff?.id === spec.id;
          return (
            <div
              key={spec.id}
              onClick={() => onSelectStaff(spec)}
              className={`p-5 rounded-xl border cursor-pointer transition flex items-center gap-4 ${
                isSelected
                  ? "border-gold-primary bg-gold-light/20 ring-2 ring-gold-primary/40 shadow-sm"
                  : "border-stone-200 hover:border-gold-primary/50 bg-[#FAF7F2]/40"
              }`}
            >
              <div className="w-14 h-14 rounded-full bg-gold-light border-2 border-gold-primary flex items-center justify-center font-serif text-lg font-bold text-gold-deep flex-shrink-0 overflow-hidden relative shadow-sm">
                {spec.avatar ? (
                  <Image
                    src={spec.avatar}
                    alt={spec.name}
                    fill
                    sizes="56px"
                    className="object-cover object-top"
                  />
                ) : (
                  spec.name.split(" ").map((n) => n[0]).slice(0, 2).join("")
                )}
              </div>
              <div>
                <h4 className="font-serif text-lg font-medium text-stone-900">{spec.name}</h4>
                <span className="text-[11px] uppercase tracking-wider text-gold-deep font-semibold block">
                  {spec.role}
                </span>
                <span className="text-xs text-stone-500 font-light block">{spec.experience}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
