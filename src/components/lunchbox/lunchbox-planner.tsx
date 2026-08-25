"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BookmarkPlus,
  Check,
  ChevronDown,
  Info,
  Layers,
  Plus,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Thermometer,
  Trash2,
  X,
} from "lucide-react";
import {
  calculateLunchboxBalance,
  deleteLunchboxTemplate,
  getLunchboxSafetyClaimText,
  getSavedTemplates,
  getWeeklyLunchboxPlan,
  LUNCHBOX_BANK,
  LUNCHBOX_GROUPS,
  LUNCHBOX_SAFETY_GUIDELINES,
  saveLunchboxTemplate,
  saveWeeklyLunchboxPlan,
  type LunchboxCompartments,
  type LunchboxGroup,
  type LunchboxItem,
  type LunchboxTemplate,
  type WeeklyLunchboxPlan,
} from "@/lib/lunchbox";
import { DAYS, type DayKey, todayDayIndex } from "@/lib/menu";
import { useToast } from "@/components/toast-provider";

interface LunchboxPlannerProps {
  babyId: string;
  babyName: string;
}

export function LunchboxPlanner({ babyId, babyName }: LunchboxPlannerProps) {
  const { showToast } = useToast();
  const [selectedDay, setSelectedDay] = useState<DayKey>(DAYS[todayDayIndex()].key);
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyLunchboxPlan>(() => getWeeklyLunchboxPlan(babyId));
  const [templates, setTemplates] = useState<LunchboxTemplate[]>(() => getSavedTemplates(babyId));
  const [selectedFilterGroup, setSelectedFilterGroup] = useState<LunchboxGroup | "all">("all");
  const [activeSlotForAdd, setActiveSlotForAdd] = useState<LunchboxGroup | null>(null);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [templateNameInput, setTemplateNameInput] = useState("");
  const [draggedItem, setDraggedItem] = useState<LunchboxItem | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<LunchboxGroup | null>(null);
  const [safetyBoxExpanded, setSafetyBoxExpanded] = useState(true);

  // Sync state when babyId changes
  useEffect(() => {
    setWeeklyPlan(getWeeklyLunchboxPlan(babyId));
    setTemplates(getSavedTemplates(babyId));
  }, [babyId]);

  const currentCompartments: LunchboxCompartments = useMemo(() => {
    return weeklyPlan[selectedDay] ?? {};
  }, [weeklyPlan, selectedDay]);

  const balance = useMemo(() => {
    return calculateLunchboxBalance(currentCompartments);
  }, [currentCompartments]);

  function handleSetItem(group: LunchboxGroup, item: LunchboxItem | undefined) {
    setWeeklyPlan((prev) => {
      const dayPlan = { ...(prev[selectedDay] ?? {}) };
      if (item) {
        dayPlan[group] = item;
      } else {
        delete dayPlan[group];
      }
      const updated = { ...prev, [selectedDay]: dayPlan };
      saveWeeklyLunchboxPlan(babyId, updated);
      return updated;
    });
    if (item) {
      showToast(`✓ ${item.name} colocado na lancheira!`);
    }
  }

  function handleClearCurrentDay() {
    setWeeklyPlan((prev) => {
      const updated = { ...prev, [selectedDay]: {} };
      saveWeeklyLunchboxPlan(babyId, updated);
      return updated;
    });
    showToast("Lancheira do dia limpa.");
  }

  function handleApplyTemplate(template: LunchboxTemplate) {
    setWeeklyPlan((prev) => {
      const updated = { ...prev, [selectedDay]: { ...template.compartments } };
      saveWeeklyLunchboxPlan(babyId, updated);
      return updated;
    });
    showToast(`✓ Modelo "${template.name}" aplicado para ${DAYS.find((d) => d.key === selectedDay)?.label}!`);
  }

  function handleSaveTemplateSubmit() {
    const name = templateNameInput.trim() || `Lancheira de ${babyName}`;
    const newTemplate: LunchboxTemplate = {
      id: `tpl-${Date.now()}`,
      name,
      compartments: { ...currentCompartments },
      createdAt: new Date().toISOString(),
    };
    const updated = saveLunchboxTemplate(babyId, newTemplate);
    setTemplates(updated);
    setTemplateNameInput("");
    setTemplateModalOpen(false);
    showToast(`✓ Modelo "${name}" salvo com sucesso!`);
  }

  function handleDeleteTemplate(id: string, name: string) {
    const updated = deleteLunchboxTemplate(babyId, id);
    setTemplates(updated);
    showToast(`Modelo "${name}" removido.`);
  }

  const filteredBank = useMemo(() => {
    if (selectedFilterGroup === "all") return LUNCHBOX_BANK;
    return LUNCHBOX_BANK.filter((item) => item.group === selectedFilterGroup);
  }, [selectedFilterGroup]);

  // Touch / Click to Add flow
  function handleSelectBankItem(item: LunchboxItem) {
    const targetGroup = activeSlotForAdd || item.group;
    handleSetItem(targetGroup, item);
    setActiveSlotForAdd(null);
  }

  return (
    <section className="flex flex-col gap-5">
      {/* Subheader Title */}
      <div className="rounded-3xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-rose-500/10 p-5">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 text-white text-sm font-bold">
            🍱
          </span>
          <h2 className="font-heading text-xl font-bold text-brown-800">
            Lanchinho de Creche & Marmita
          </h2>
        </div>
        <p className="mt-1 text-sm text-brown-700">
          Planejador prático para a fase 24m+. Monte lanches equilibrados, que não vazam e aguentam bem até a hora do recreio de {babyName}.
        </p>
      </div>

      {/* Weekday Switcher */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {DAYS.map((day) => {
          const isSelected = day.key === selectedDay;
          const dayItemsCount = Object.values(weeklyPlan[day.key] ?? {}).filter(Boolean).length;
          return (
            <button
              key={day.key}
              type="button"
              onClick={() => setSelectedDay(day.key)}
              className={`relative min-h-12 shrink-0 rounded-2xl px-4 text-base font-semibold transition-all ${
                isSelected
                  ? "bg-amber-500 text-white shadow-sm"
                  : "bg-amber-50/80 text-brown-700 active:bg-amber-100"
              }`}
            >
              {day.short}
              {dayItemsCount > 0 && (
                <span
                  className={`absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-[11px] font-bold ${
                    isSelected ? "bg-white text-amber-600" : "bg-amber-500 text-white"
                  }`}
                >
                  {dayItemsCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Quick Template Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-white/70 p-3 shadow-sm shadow-brown-900/5">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTemplateModalOpen(true)}
            className="flex min-h-9 items-center gap-1.5 rounded-full bg-amber-100 px-3 text-xs font-bold text-amber-800 active:bg-amber-200"
          >
            <BookmarkPlus className="h-3.5 w-3.5" />
            Salvar como modelo
          </button>
          {balance.totalItems > 0 && (
            <button
              type="button"
              onClick={handleClearCurrentDay}
              className="flex min-h-9 items-center gap-1 rounded-full bg-gray-100 px-3 text-xs font-semibold text-brown-700 active:bg-gray-200"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Limpar dia
            </button>
          )}
        </div>

        {templates.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-[11px] font-medium text-brown-700/86 uppercase">Modelos:</span>
            {templates.slice(0, 3).map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => handleApplyTemplate(tpl)}
                className="min-h-8 rounded-full border border-amber-200 bg-white px-2.5 text-xs font-medium text-brown-800 active:bg-amber-50"
              >
                {tpl.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bento Box Visual Container */}
      <div className="rounded-3xl border-4 border-amber-200 bg-amber-50/40 p-4 shadow-md">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-brown-800">
              Marmita de {DAYS.find((d) => d.key === selectedDay)?.label}
            </span>
          </div>
          <span className="text-xs font-semibold text-amber-800 bg-amber-200/70 px-2.5 py-1 rounded-full">
            {balance.totalItems} de 5 itens
          </span>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-2 gap-3">
          {LUNCHBOX_GROUPS.map((group) => {
            const item = currentCompartments[group.key];
            const isDragOver = dragOverSlot === group.key;
            const isSelectedForAdd = activeSlotForAdd === group.key;

            return (
              <div
                key={group.key}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverSlot(group.key);
                }}
                onDragLeave={() => setDragOverSlot(null)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOverSlot(null);
                  if (draggedItem) {
                    handleSetItem(group.key, draggedItem);
                    setDraggedItem(null);
                  }
                }}
                className={`relative flex min-h-28 flex-col justify-between rounded-2xl p-3.5 transition-all ${
                  item
                    ? "bg-white shadow-sm border border-brown-900/5"
                    : isDragOver
                    ? "border-2 border-dashed border-amber-500 bg-amber-100/60 scale-[1.02]"
                    : isSelectedForAdd
                    ? "border-2 border-amber-500 bg-white shadow-md"
                    : "border-2 border-dashed border-amber-200/80 bg-white/50 hover:bg-white/80"
                } ${group.key === "laticinio_extra" ? "col-span-2" : ""}`}
              >
                {/* Slot Header */}
                <div className="flex items-center justify-between gap-1">
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold"
                    style={{ backgroundColor: group.bgColor, color: group.textColor }}
                  >
                    <span>{group.emoji}</span>
                    <span>{group.shortLabel}</span>
                  </span>

                  {item && (
                    <button
                      type="button"
                      onClick={() => handleSetItem(group.key, undefined)}
                      className="flex h-6 w-6 items-center justify-center rounded-full text-brown-700/78 hover:bg-rose-50 hover:text-rose-600"
                      title="Remover item"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Slot Content */}
                {item ? (
                  <div className="my-1.5 flex items-start gap-2.5">
                    <span className="text-2xl shrink-0">{item.emoji}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold leading-snug text-brown-800 truncate">
                        {item.name}
                      </p>
                      {item.prepNote && (
                        <p className="mt-0.5 text-[11px] text-brown-700/90 line-clamp-2">
                          💡 {item.prepNote}
                        </p>
                      )}
                      {item.allergens && item.allergens.length > 0 && (
                        <span className="mt-1 inline-block rounded bg-peach-100 px-1.5 py-0.5 text-[11px] font-bold text-terracotta-600">
                          Contém: {item.allergens.join(", ")}
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSlotForAdd(isSelectedForAdd ? null : group.key);
                      setSelectedFilterGroup(group.key);
                    }}
                    className="my-auto flex flex-col items-center justify-center py-2 text-center"
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-amber-700 mb-1">
                      <Plus className="h-4 w-4" />
                    </span>
                    <span className="text-xs font-semibold text-brown-700/86">
                      {isSelectedForAdd ? "Escolha abaixo" : `Adicionar ${group.shortLabel.toLowerCase()}`}
                    </span>
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Nutritional Balance Bar in Lunchbox */}
        <div className="mt-4 rounded-2xl bg-white p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-brown-800">
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              Equilíbrio da marmitinha
            </span>
            <span className={balance.isBalanced ? "text-sage-600 font-bold" : "text-amber-600"}>
              {balance.scorePercent}%
            </span>
          </div>

          {/* Segmented color bar */}
          <div className="mt-2 flex h-3 w-full overflow-hidden rounded-full bg-gray-100">
            {LUNCHBOX_GROUPS.map((g) => {
              const present = currentCompartments[g.key];
              const width = present ? g.idealPercent : 0;
              return (
                <div
                  key={g.key}
                  style={{
                    width: `${width}%`,
                    backgroundColor: g.color,
                  }}
                  className="h-full transition-all duration-300"
                  title={`${g.label}: ${present ? "Presente" : "Faltando"}`}
                />
              );
            })}
          </div>

          <p className="mt-2 text-xs text-brown-700">{balance.feedback}</p>
        </div>
      </div>

      {/* Bank of Recommended Lunchbox Items (Touch & Drag) */}
      <div className="rounded-3xl bg-white/80 p-5 shadow-sm shadow-brown-900/5">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-lg font-bold text-brown-800">
            Banco de Itens para Lancheira
          </h3>
          <span className="text-xs text-brown-700/86">Toque ou arraste para a marmita</span>
        </div>

        {/* Filter Pills */}
        <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setSelectedFilterGroup("all")}
            className={`min-h-9 shrink-0 rounded-full px-3 text-xs font-semibold transition-colors ${
              selectedFilterGroup === "all"
                ? "bg-brown-800 text-white"
                : "bg-sage-50 text-brown-700 hover:bg-sage-100"
            }`}
          >
            Todos ({LUNCHBOX_BANK.length})
          </button>
          {LUNCHBOX_GROUPS.map((g) => (
            <button
              key={g.key}
              type="button"
              onClick={() => setSelectedFilterGroup(g.key)}
              className={`min-h-9 shrink-0 rounded-full px-3 text-xs font-semibold transition-colors ${
                selectedFilterGroup === g.key
                  ? "text-white shadow-sm"
                  : "bg-sage-50 text-brown-700 hover:bg-sage-100"
              }`}
              style={selectedFilterGroup === g.key ? { backgroundColor: g.color } : {}}
            >
              {g.emoji} {g.shortLabel}
            </button>
          ))}
        </div>

        {/* Item Cards Grid */}
        <div className="mt-3.5 grid grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
          {filteredBank.map((item) => {
            const groupConfig = LUNCHBOX_GROUPS.find((g) => g.key === item.group)!;
            const isAlreadyInDay = currentCompartments[item.group]?.id === item.id;

            return (
              <div
                key={item.id}
                draggable
                onDragStart={() => setDraggedItem(item)}
                onDragEnd={() => setDraggedItem(null)}
                onClick={() => handleSelectBankItem(item)}
                className={`group flex cursor-pointer flex-col justify-between rounded-2xl border p-3 transition-all active:scale-[0.98] ${
                  isAlreadyInDay
                    ? "border-sage-300 bg-sage-50/60"
                    : "border-gray-100 bg-white hover:border-amber-300 hover:bg-amber-50/30"
                }`}
              >
                <div className="flex items-start justify-between gap-1">
                  <span className="text-2xl">{item.emoji}</span>
                  <span
                    className="rounded px-1.5 py-0.5 text-[11px] font-bold"
                    style={{ backgroundColor: groupConfig.bgColor, color: groupConfig.textColor }}
                  >
                    {groupConfig.shortLabel}
                  </span>
                </div>

                <div className="mt-2">
                  <p className="text-xs font-bold text-brown-800 leading-tight">
                    {item.name}
                  </p>
                  {item.allergens && (
                    <p className="mt-0.5 text-[11px] text-terracotta-600">
                      Alérgeno: {item.allergens.join(", ")}
                    </p>
                  )}
                </div>

                <div className="mt-2 flex items-center justify-between pt-1 border-t border-gray-50">
                  <span className="text-[11px] text-brown-700/82">
                    {isAlreadyInDay ? "✓ Na marmita" : "+ Adicionar"}
                  </span>
                  <Plus className="h-3.5 w-3.5 text-amber-500 opacity-0 group-hover:opacity-100" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Food Safety & School Allergy Alert Box */}
      <div className="overflow-hidden rounded-3xl bg-amber-500/10 border border-amber-500/20 shadow-sm">
        <button
          type="button"
          onClick={() => setSafetyBoxExpanded(!safetyBoxExpanded)}
          className="flex w-full items-center justify-between p-4 text-left"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white shadow-sm">
              <Thermometer className="h-5 w-5" />
            </span>
            <div>
              <h4 className="font-heading text-base font-bold text-brown-800">
                Segurança Alimentar da Lancheira
              </h4>
              <p className="text-xs text-brown-700/90">
                Tempo fora da geladeira, alimentos proibidos e alérgenos na creche
              </p>
            </div>
          </div>
          <ChevronDown
            className={`h-5 w-5 text-brown-700/86 transition-transform ${
              safetyBoxExpanded ? "rotate-180" : ""
            }`}
          />
        </button>

        {safetyBoxExpanded && (
          <div className="border-t border-amber-500/15 p-4 pt-3 flex flex-col gap-3 text-xs text-brown-800">
            <div className="flex items-start gap-2 rounded-xl bg-white/70 p-3">
              <Thermometer className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <strong className="block text-brown-800">Tempo seguro sem geladeira</strong>
                <p className="text-brown-700/80 mt-0.5">{getLunchboxSafetyClaimText("lb-safety-temperature-hours")}</p>
              </div>
            </div>

            <div className="flex items-start gap-2 rounded-xl bg-white/70 p-3">
              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
              <div>
                <strong className="block text-brown-800">Não enviar sem refrigeração garantida</strong>
                <ul className="mt-1 list-disc pl-4 text-brown-700/80 space-y-0.5">
                  {LUNCHBOX_SAFETY_GUIDELINES.noFridgeFoods.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex items-start gap-2 rounded-xl bg-white/70 p-3">
              <ShieldAlert className="h-4 w-4 shrink-0 text-amber-700 mt-0.5" />
              <div>
                <strong className="block text-brown-800">Política de alérgenos da creche</strong>
                <p className="text-brown-700/80 mt-0.5">{LUNCHBOX_SAFETY_GUIDELINES.allergySchoolNotice}</p>
              </div>
            </div>

            <div className="flex items-start gap-2 rounded-xl bg-white/70 p-3">
              <Info className="h-4 w-4 shrink-0 text-sage-600 mt-0.5" />
              <div>
                <strong className="block text-brown-800">Atenção aos cortes</strong>
                <p className="text-brown-700/80 mt-0.5">{getLunchboxSafetyClaimText("lb-safety-cut-round-foods")}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Save Template Modal */}
      {templateModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-brown-900/40 p-4 backdrop-blur-[2px]"
          onClick={() => setTemplateModalOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-xl animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-lg font-bold text-brown-800">
                Salvar Modelo de Marmita
              </h3>
              <button
                type="button"
                onClick={() => setTemplateModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-brown-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-1 text-xs text-brown-700/90">
              Dê um nome para reutilizar esta combinação em qualquer dia da semana.
            </p>

            <input
              type="text"
              autoFocus
              value={templateNameInput}
              onChange={(e) => setTemplateNameInput(e.target.value)}
              placeholder="Ex: Lancheira Rápida de Segunda"
              className="mt-4 min-h-12 w-full rounded-2xl border border-amber-200 bg-amber-50/40 px-4 text-sm text-brown-800 outline-none focus:border-amber-500"
            />

            <div className="mt-4 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleSaveTemplateSubmit}
                className="min-h-12 w-full rounded-2xl bg-amber-500 text-sm font-bold text-white shadow-sm active:bg-amber-600"
              >
                Salvar Modelo
              </button>
              <button
                type="button"
                onClick={() => setTemplateModalOpen(false)}
                className="min-h-10 text-xs font-semibold text-brown-700"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
