"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Zap,
  MapPin,
  CreditCard,
  Clock,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Activity,
  DollarSign,
  Search,
  Wallet,
  Plug,
  Battery,
  Timer,
  Plus,
  Coffee,
  Check,
  Sparkles,
  Lock,
  Shield,
  Trash2,
  AlertTriangle,
  X,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type Card = {
  id: string;
  brand: string;
  last4: string;
  expiry: string;
  isDefault: boolean;
};

// ─── Data ────────────────────────────────────────────────────────────────────

const CHARGERS = [
  {
    id: "CHG-0041",
    name: "Supercharger A4",
    location: "71 Macquarie St, Sydney",
    power: "150 kW",
    price: "$0.42/kWh",
    status: "available" as const,
    estimatedTime: "~22 min",
    network: "Chargefox",
  },
  {
    id: "CHG-0038",
    name: "Fast Charger B2",
    location: "71 Macquarie St, Sydney",
    power: "50 kW",
    price: "$0.38/kWh",
    status: "available" as const,
    estimatedTime: "~45 min",
    network: "Chargefox",
  },
  {
    id: "CHG-0055",
    name: "Rapid Charger C1",
    location: "71 Macquarie St, Sydney",
    power: "350 kW",
    price: "$0.52/kWh",
    status: "in-use" as const,
    estimatedTime: "~12 min",
    network: "Chargefox",
  },
];

const SAVED_CARDS = [
  { id: "visa-1", brand: "Visa", last4: "4242", expiry: "09/27", isDefault: true },
  { id: "mc-1", brand: "Mastercard", last4: "8888", expiry: "12/26", isDefault: false },
];

const OPERATOR_SESSIONS = [
  {
    id: "SES-20260814-001",
    driver: "Alex M.",
    charger: "A4",
    connector: "CCS2",
    start: "14:22",
    end: "14:48",
    duration: "26 min",
    kWh: 38.4,
    rate: 0.42,
    total: 16.13,
    paymentStatus: "settled" as const,
    settlementStatus: "paid" as const,
    cardLast4: "4242",
  },
  {
    id: "SES-20260814-002",
    driver: "Sam K.",
    charger: "B2",
    connector: "CHAdeMO",
    start: "14:35",
    end: "15:20",
    duration: "45 min",
    kWh: 41.2,
    rate: 0.38,
    total: 15.66,
    paymentStatus: "pending" as const,
    settlementStatus: "pending" as const,
    cardLast4: "8888",
  },
  {
    id: "SES-20260814-003",
    driver: "Jordan L.",
    charger: "C1",
    connector: "CCS2",
    start: "15:01",
    end: "15:12",
    duration: "11 min",
    kWh: 22.7,
    rate: 0.52,
    total: 11.80,
    paymentStatus: "settled" as const,
    settlementStatus: "paid" as const,
    cardLast4: "1234",
  },
  {
    id: "SES-20260814-004",
    driver: "Taylor R.",
    charger: "A4",
    connector: "CCS2",
    start: "15:15",
    end: "15:41",
    duration: "26 min",
    kWh: 35.9,
    rate: 0.42,
    total: 15.08,
    paymentStatus: "settled" as const,
    settlementStatus: "pending" as const,
    cardLast4: "5678",
  },
  {
    id: "SES-20260814-005",
    driver: "Casey W.",
    charger: "B2",
    connector: "CHAdeMO",
    start: "15:30",
    end: "16:08",
    duration: "38 min",
    kWh: 36.1,
    rate: 0.38,
    total: 13.72,
    paymentStatus: "failed" as const,
    settlementStatus: "failed" as const,
    cardLast4: "9012",
  },
];

const RECONCILIATION_BATCHES = [
  {
    id: "BATCH-20260814",
    date: "14 Aug 2026",
    transactionCount: 47,
    expectedTotal: 1842.36,
    receivedTotal: 1828.91,
    matchedCount: 44,
    mismatchCount: 3,
    status: "partial" as const,
  },
  {
    id: "BATCH-20260813",
    date: "13 Aug 2026",
    transactionCount: 52,
    expectedTotal: 2104.18,
    receivedTotal: 2104.18,
    matchedCount: 52,
    mismatchCount: 0,
    status: "matched" as const,
  },
  {
    id: "BATCH-20260812",
    date: "12 Aug 2026",
    transactionCount: 39,
    expectedTotal: 1567.44,
    receivedTotal: 1567.44,
    matchedCount: 39,
    mismatchCount: 0,
    status: "matched" as const,
  },
];

// ─── Shared Components ───────────────────────────────────────────────────────

function StatusBadge({
  status,
  size = "sm",
}: {
  status: "available" | "in-use" | "settled" | "pending" | "failed" | "paid" | "partial" | "matched";
  size?: "sm" | "md";
}) {
  const config = {
    available: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", label: "Available" },
    "in-use": { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500", label: "In use" },
    settled: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", label: "Settled" },
    pending: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500", label: "Pending" },
    failed: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500", label: "Failed" },
    paid: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", label: "Paid" },
    partial: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500", label: "Partial" },
    matched: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", label: "Matched" },
  };
  const c = config[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${
        size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-sm"
      } ${c.bg} ${c.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

function TabBar({
  activeTab,
  onTabChange,
}: {
  activeTab: "driver" | "operator";
  onTabChange: (tab: "driver" | "operator") => void;
}) {
  return (
    <div className="flex rounded-xl bg-slate-100 p-1">
      {(["driver", "operator"] as const).map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
            activeTab === tab
              ? "bg-white text-navy-800 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          {tab === "driver" ? "Driver" : "Operator"}
        </button>
      ))}
    </div>
  );
}

// ─── Driver: Charger Select ──────────────────────────────────────────────────

function ChargerSelect({ onSelect }: { onSelect: (charger: (typeof CHARGERS)[0]) => void }) {
  const [search, setSearch] = useState("");

  const filtered = CHARGERS.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-navy-900 sm:text-3xl">
          Find a charger
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Select a charger to start your session
        </p>
      </div>

      <div className="relative mb-5">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 transition-colors focus:border-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-700/20"
        />
      </div>

      <div className="space-y-3">
        {filtered.map((charger) => (
          <button
            key={charger.id}
            onClick={() => onSelect(charger)}
            disabled={charger.status !== "available"}
            className={`w-full rounded-2xl border p-4 text-left transition-all duration-200 ${
              charger.status === "available"
                ? "border-slate-200 bg-white hover:border-navy-700 hover:shadow-md active:scale-[0.98]"
                : "cursor-not-allowed border-slate-100 bg-slate-50 opacity-60"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-50">
                    <Zap className="h-5 w-5 text-navy-700" />
                  </div>
                  <div>
                    <h3 className="font-heading text-sm font-bold text-navy-900">
                      {charger.name}
                    </h3>
                    <p className="text-xs text-slate-500">{charger.id}</p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {charger.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    {charger.power}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {charger.estimatedTime}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <StatusBadge status={charger.status} />
                <span className="text-sm font-bold text-navy-800">{charger.price}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isCardExpiringSoon(expiry: string): boolean {
  const [month, year] = expiry.split("/").map(Number);
  const expiryDate = new Date(2000 + year, month);
  const now = new Date();
  const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  return expiryDate <= thirtyDays;
}

// ─── Driver: Payment ─────────────────────────────────────────────────────────

function Payment({
  charger,
  cards,
  selectedCardId,
  onSelectCard,
  onAddCard,
  onRemoveCard,
  onConfirm,
  onBack,
}: {
  charger: (typeof CHARGERS)[0];
  cards: Card[];
  selectedCardId: string;
  onSelectCard: (id: string) => void;
  onAddCard: (card: Card) => void;
  onRemoveCard: (id: string) => void;
  onConfirm: () => void;
  onBack: () => void;
}) {
  const [showAddCard, setShowAddCard] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  if (showAddCard) {
    return (
      <AddCardForm
        onBack={() => setShowAddCard(false)}
        onSaved={(newCard) => {
          onAddCard(newCard);
          onSelectCard(newCard.id);
          setShowAddCard(false);
        }}
      />
    );
  }

  return (
    <div className="animate-fade-in">
      <button onClick={onBack} className="mb-5 flex items-center gap-1 text-sm font-medium text-navy-700 hover:text-navy-900">
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-navy-900 sm:text-3xl">
          Confirm payment
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Review your charger and select a payment method
        </p>
      </div>

      <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy-50">
            <Zap className="h-5 w-5 text-navy-700" />
          </div>
          <div className="flex-1">
            <p className="font-heading text-sm font-bold text-navy-900">{charger.name}</p>
            <p className="text-xs text-slate-500">{charger.location}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-navy-800">{charger.price}</p>
            <p className="text-xs text-slate-500">{charger.estimatedTime}</p>
          </div>
        </div>
      </div>

      <div className="mb-5">
        <h2 className="mb-3 font-heading text-sm font-bold text-slate-700">Payment method</h2>
        <div className="space-y-2.5">
          {cards.map((card) => {
            const expiring = isCardExpiringSoon(card.expiry);
            const isDeleting = confirmDelete === card.id;
            return (
              <div key={card.id}>
                <button
                  onClick={() => onSelectCard(card.id)}
                  className={`flex w-full items-center gap-3 rounded-xl border p-3.5 transition-all duration-200 ${
                    selectedCardId === card.id
                      ? "border-navy-700 bg-navy-50 ring-2 ring-navy-700/20"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm">
                    <CreditCard className="h-5 w-5 text-navy-700" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-navy-900">
                        {card.brand} ending in {card.last4}
                      </p>
                      {expiring && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                          <AlertTriangle className="h-2.5 w-2.5" />
                          Expiring soon
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">Expires {card.expiry}</p>
                  </div>
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors ${
                      selectedCardId === card.id
                        ? "border-navy-700 bg-navy-700"
                        : "border-slate-300"
                    }`}
                  >
                    {selectedCardId === card.id && <Check className="h-3 w-3 text-white" />}
                  </div>
                </button>
                {selectedCardId === card.id && !card.isDefault && (
                  <div className="mt-1.5 flex justify-end">
                    {isDeleting ? (
                      <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-1.5 text-xs">
                        <span className="text-red-700">Remove this card?</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveCard(card.id);
                            setConfirmDelete(null);
                          }}
                          className="font-semibold text-red-700 hover:text-red-900"
                        >
                          Yes
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDelete(null);
                          }}
                          className="font-semibold text-slate-500 hover:text-slate-700"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmDelete(card.id);
                        }}
                        className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-500"
                      >
                        <Trash2 className="h-3 w-3" />
                        Remove
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          <button
            onClick={() => setShowAddCard(true)}
            className="flex w-full items-center gap-3 rounded-xl border border-dashed border-slate-300 p-3.5 text-sm font-medium text-slate-500 transition-colors hover:border-navy-700 hover:text-navy-700"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50">
              <Plus className="h-5 w-5" />
            </div>
            Add new card
          </button>
        </div>
      </div>

      <button
        onClick={onConfirm}
        className="w-full rounded-xl bg-navy-800 py-3.5 text-sm font-bold text-white shadow-lg shadow-navy-800/25 transition-all duration-200 hover:bg-navy-900 active:scale-[0.98]"
      >
        Start charging session
      </button>

      <p className="mt-3 text-center text-xs text-slate-400">
        You will be charged per kWh as you charge. No upfront hold.
      </p>
    </div>
  );
}

// ─── Driver: Add Card Form ───────────────────────────────────────────────────

function AddCardForm({
  onBack,
  onSaved,
}: {
  onBack: () => void;
  onSaved: (card: { id: string; brand: string; last4: string; expiry: string; isDefault: boolean }) => void;
}) {
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [name, setName] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  function formatCardNumber(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
  }

  function formatExpiry(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) {
      return digits.slice(0, 2) + "/" + digits.slice(2);
    }
    return digits;
  }

  function detectBrand(number: string): string {
    const first = number.replace(/\s/g, "").charAt(0);
    if (first === "4") return "Visa";
    if (first === "5") return "Mastercard";
    if (first === "3") return "Amex";
    return "Card";
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    const raw = cardNumber.replace(/\s/g, "");

    if (raw.length < 13 || raw.length > 16) {
      newErrors.cardNumber = "Enter a valid card number";
    }
    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      newErrors.expiry = "Use MM/YY format";
    } else {
      const [month] = expiry.split("/").map(Number);
      if (month < 1 || month > 12) {
        newErrors.expiry = "Enter a valid month";
      }
    }
    if (cvv.length < 3 || cvv.length > 4) {
      newErrors.cvv = "Enter a valid CVV";
    }
    if (name.trim().length < 2) {
      newErrors.name = "Enter the cardholder name";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    setTimeout(() => {
      const raw = cardNumber.replace(/\s/g, "");
      onSaved({
        id: `card-${Date.now()}`,
        brand: detectBrand(raw),
        last4: raw.slice(-4),
        expiry,
        isDefault: false,
      });
    }, 800);
  }

  return (
    <div className="animate-fade-in">
      <button onClick={onBack} className="mb-5 flex items-center gap-1 text-sm font-medium text-navy-700 hover:text-navy-900">
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-navy-900 sm:text-3xl">
          Add a card
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Enter your card details to start charging
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Card number
          </label>
          <div className="relative">
            <CreditCard className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              inputMode="numeric"
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              className={`w-full rounded-xl border bg-white py-3 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 transition-colors focus:outline-none focus:ring-2 ${
                errors.cardNumber
                  ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                  : "border-slate-200 focus:border-navy-700 focus:ring-navy-700/20"
              }`}
            />
            {cardNumber && (
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-navy-700">
                {detectBrand(cardNumber)}
              </span>
            )}
          </div>
          {errors.cardNumber && (
            <p className="mt-1 text-xs text-red-500">{errors.cardNumber}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Expiry
            </label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="MM/YY"
              value={expiry}
              onChange={(e) => setExpiry(formatExpiry(e.target.value))}
              className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-800 placeholder-slate-400 transition-colors focus:outline-none focus:ring-2 ${
                errors.expiry
                  ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                  : "border-slate-200 focus:border-navy-700 focus:ring-navy-700/20"
              }`}
            />
            {errors.expiry && (
              <p className="mt-1 text-xs text-red-500">{errors.expiry}</p>
            )}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              CVV
            </label>
            <div className="relative">
              <input
                type="password"
                inputMode="numeric"
                placeholder="123"
                maxLength={4}
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-800 placeholder-slate-400 transition-colors focus:outline-none focus:ring-2 ${
                  errors.cvv
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                    : "border-slate-200 focus:border-navy-700 focus:ring-navy-700/20"
                }`}
              />
              <Lock className="absolute right-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            </div>
            {errors.cvv && (
              <p className="mt-1 text-xs text-red-500">{errors.cvv}</p>
            )}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Cardholder name
          </label>
          <input
            type="text"
            placeholder="Name on card"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-800 placeholder-slate-400 transition-colors focus:outline-none focus:ring-2 ${
              errors.name
                ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                : "border-slate-200 focus:border-navy-700 focus:ring-navy-700/20"
            }`}
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-500">{errors.name}</p>
          )}
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
          <Shield className="h-4 w-4 shrink-0 text-slate-400" />
          Your card details are encrypted and stored securely. We never share your data with third parties.
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-xl bg-navy-800 py-3.5 text-sm font-bold text-white shadow-lg shadow-navy-800/25 transition-all duration-200 hover:bg-navy-900 active:scale-[0.98] disabled:opacity-60 disabled:active:scale-100"
        >
          {saving ? (
            <span className="inline-flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Saving card...
            </span>
          ) : (
            "Save card"
          )}
        </button>
      </form>
    </div>
  );
}

// ─── Driver: Active Session ──────────────────────────────────────────────────

function ActiveSession({
  charger,
  onEnd,
}: {
  charger: (typeof CHARGERS)[0];
  onEnd: () => void;
}) {
  const [kWh, setKWh] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const rate = parseFloat(charger.price.replace(/[^0-9.]/g, ""));

  useEffect(() => {
    const interval = setInterval(() => {
      setKWh((prev) => {
        const increment = charger.power.includes("350") ? 0.3 : charger.power.includes("150") ? 0.15 : 0.08;
        return Math.min(prev + increment, 50);
      });
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [charger.power]);

  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  const cost = (kWh * rate).toFixed(2);

  return (
    <div className="animate-fade-in">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-navy-800 shadow-lg shadow-navy-800/30 animate-pulse-glow">
          <Plug className="h-8 w-8 text-gold-400" />
        </div>
        <h1 className="font-heading text-2xl font-bold text-navy-900 sm:text-3xl">
          Charging in progress
        </h1>
        <p className="mt-1 text-sm text-slate-500">{charger.name} &middot; {charger.id}</p>
      </div>

      <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm text-slate-500">Energy delivered</span>
          <span className="font-heading text-2xl font-bold text-navy-900">
            {kWh.toFixed(1)} <span className="text-sm font-medium text-slate-500">kWh</span>
          </span>
        </div>
        <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-navy-700 to-navy-500 transition-all duration-1000"
            style={{ width: `${Math.min((kWh / 40) * 100, 100)}%` }}
          />
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-xl bg-slate-50 p-3">
            <Timer className="mx-auto mb-1 h-4 w-4 text-slate-400" />
            <p className="font-heading text-lg font-bold text-navy-900">
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </p>
            <p className="text-xs text-slate-500">Duration</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <DollarSign className="mx-auto mb-1 h-4 w-4 text-slate-400" />
            <p className="font-heading text-lg font-bold text-navy-900">${cost}</p>
            <p className="text-xs text-slate-500">Cost</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <Battery className="mx-auto mb-1 h-4 w-4 text-slate-400" />
            <p className="font-heading text-lg font-bold text-navy-900">
              {charger.power}
            </p>
            <p className="text-xs text-slate-500">Rate</p>
          </div>
        </div>
      </div>

      <div className="mb-5 rounded-2xl border border-gold-100 bg-gold-50 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gold-100">
            <Coffee className="h-4 w-4 text-gold-500" />
          </div>
          <div>
            <p className="font-heading text-sm font-bold text-navy-900">While you wait</p>
            <p className="mt-0.5 text-xs text-slate-600">
              10% off your next coffee at the station cafe. Pay with your linked card to redeem.
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={onEnd}
        className="w-full rounded-xl border-2 border-navy-800 bg-white py-3.5 text-sm font-bold text-navy-800 transition-all duration-200 hover:bg-navy-50 active:scale-[0.98]"
      >
        End session
      </button>
    </div>
  );
}

// ─── Driver: Receipt ─────────────────────────────────────────────────────────

function Receipt({
  charger,
  card,
  onDone,
}: {
  charger: (typeof CHARGERS)[0];
  card: Card | undefined;
  onDone: () => void;
}) {
  const kWh = 38.4;
  const rate = parseFloat(charger.price.replace(/[^0-9.]/g, ""));
  const subtotal = kWh * rate;
  const gst = subtotal * 0.1;
  const total = subtotal + gst;

  return (
    <div className="animate-fade-in">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50">
          <CheckCircle2 className="h-8 w-8 text-emerald-500" />
        </div>
        <h1 className="font-heading text-2xl font-bold text-navy-900 sm:text-3xl">
          Session complete
        </h1>
        <p className="mt-1 text-sm text-slate-500">Your receipt is ready</p>
      </div>

      <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <p className="font-heading text-sm font-bold text-navy-900">{charger.name}</p>
            <p className="text-xs text-slate-500">{charger.location}</p>
          </div>
          <StatusBadge status="settled" />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Session ID</span>
            <span className="font-medium text-navy-900">SES-20260814-001</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Connector</span>
            <span className="font-medium text-navy-900">CCS2 &middot; {charger.power}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Duration</span>
            <span className="font-medium text-navy-900">26 min</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Energy</span>
            <span className="font-medium text-navy-900">{kWh} kWh</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Rate</span>
            <span className="font-medium text-navy-900">${rate.toFixed(2)}/kWh</span>
          </div>
        </div>

        <div className="mt-4 border-t border-slate-100 pt-4">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Subtotal</span>
            <span className="font-medium text-navy-900">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">GST (10%)</span>
            <span className="font-medium text-navy-900">${gst.toFixed(2)}</span>
          </div>
          <div className="mt-2 flex justify-between">
            <span className="font-heading text-sm font-bold text-navy-900">Total</span>
            <span className="font-heading text-lg font-bold text-navy-900">${total.toFixed(2)}</span>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
          <CreditCard className="h-4 w-4 shrink-0" />
          Paid with {card?.brand || "Card"} ending in {card?.last4 || "----"}
        </div>
      </div>

      <div className="mb-5 rounded-2xl border border-gold-100 bg-gold-50 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gold-100">
            <Sparkles className="h-4 w-4 text-gold-500" />
          </div>
          <div>
            <p className="font-heading text-sm font-bold text-navy-900">Nice charge</p>
            <p className="mt-0.5 text-xs text-slate-600">
              You saved $4.20 compared to the average fuel cost for the same distance. Keep going electric.
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={onDone}
        className="w-full rounded-xl bg-navy-800 py-3.5 text-sm font-bold text-white shadow-lg shadow-navy-800/25 transition-all duration-200 hover:bg-navy-900 active:scale-[0.98]"
      >
        Done
      </button>
    </div>
  );
}

// ─── Operator: Metric Card ───────────────────────────────────────────────────

function MetricCard({
  icon: Icon,
  label,
  value,
  change,
  changeType = "positive",
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-50">
          <Icon className="h-5 w-5 text-navy-700" />
        </div>
        {change && (
          <span
            className={`text-xs font-semibold ${
              changeType === "positive"
                ? "text-emerald-600"
                : changeType === "negative"
                ? "text-red-500"
                : "text-slate-500"
            }`}
          >
            {change}
          </span>
        )}
      </div>
      <p className="font-heading text-2xl font-bold text-navy-900">{value}</p>
      <p className="mt-0.5 text-xs text-slate-500">{label}</p>
    </div>
  );
}

// ─── Operator: Sessions Table ────────────────────────────────────────────────

function SessionsTable() {
  const [filter, setFilter] = useState<string>("all");

  const filtered = OPERATOR_SESSIONS.filter((s) => {
    if (filter === "all") return true;
    return s.paymentStatus === filter;
  });

  return (
    <div className="rounded-2xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 p-4 sm:p-5">
        <h2 className="font-heading text-base font-bold text-navy-900">Recent sessions</h2>
        <div className="flex gap-1.5 overflow-x-auto pb-0.5">
          {["all", "settled", "pending", "failed"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                filter === f
                  ? "bg-navy-800 text-white"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="hidden w-full text-left text-sm md:table">
          <thead>
            <tr className="border-b border-slate-100 text-xs text-slate-500">
              <th className="px-4 py-3 font-medium sm:px-5">Session</th>
              <th className="px-4 py-3 font-medium sm:px-5">Charger</th>
              <th className="px-4 py-3 font-medium sm:px-5">Duration</th>
              <th className="px-4 py-3 font-medium sm:px-5">Energy</th>
              <th className="px-4 py-3 font-medium sm:px-5">Total</th>
              <th className="px-4 py-3 font-medium sm:px-5">Status</th>
              <th className="px-4 py-3 font-medium sm:px-5">Settlement</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.map((session) => (
              <tr key={session.id} className="transition-colors hover:bg-slate-50/50">
                <td className="px-4 py-3 sm:px-5">
                  <p className="font-medium text-navy-900">{session.driver}</p>
                  <p className="text-xs text-slate-400">{session.id.split("-").pop()}</p>
                </td>
                <td className="px-4 py-3 sm:px-5">
                  <p className="text-navy-800">{session.charger}</p>
                  <p className="text-xs text-slate-400">{session.connector}</p>
                </td>
                <td className="px-4 py-3 text-slate-600 sm:px-5">
                  {session.duration}
                </td>
                <td className="px-4 py-3 font-medium text-navy-800 sm:px-5">{session.kWh} kWh</td>
                <td className="px-4 py-3 font-semibold text-navy-900 sm:px-5">${session.total.toFixed(2)}</td>
                <td className="px-4 py-3 sm:px-5">
                  <StatusBadge status={session.paymentStatus} />
                </td>
                <td className="px-4 py-3 sm:px-5">
                  <StatusBadge status={session.settlementStatus} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="space-y-2 md:hidden">
          {filtered.map((session) => (
            <div key={session.id} className="rounded-xl border border-slate-100 p-3.5">
              <div className="mb-2.5 flex items-center justify-between">
                <div>
                  <p className="font-heading text-sm font-bold text-navy-900">{session.driver}</p>
                  <p className="text-xs text-slate-400">
                    {session.charger} &middot; {session.connector} &middot; {session.duration}
                  </p>
                </div>
                <p className="font-heading text-sm font-bold text-navy-900">${session.total.toFixed(2)}</p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <StatusBadge status={session.paymentStatus} />
                  <StatusBadge status={session.settlementStatus} />
                </div>
                <span className="text-xs text-slate-500">{session.kWh} kWh</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="p-8 text-center text-sm text-slate-400">
          No sessions match this filter
        </div>
      )}
    </div>
  );
}

// ─── Operator: Reconciliation ────────────────────────────────────────────────

function ReconciliationView() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      {RECONCILIATION_BATCHES.map((batch) => (
        <div
          key={batch.id}
          className="rounded-2xl border border-slate-200 bg-white"
        >
          <button
            onClick={() => setExpanded(expanded === batch.id ? null : batch.id)}
            className="flex w-full items-center justify-between p-4 text-left sm:p-5"
          >
            <div>
              <div className="flex items-center gap-2">
                <p className="font-heading text-sm font-bold text-navy-900">{batch.id}</p>
                <StatusBadge status={batch.status} />
              </div>
              <p className="mt-1 text-xs text-slate-500">{batch.date}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-navy-900">
                ${batch.receivedTotal.toFixed(2)}
              </p>
              <p className="text-xs text-slate-500">
                {batch.transactionCount} transactions
              </p>
            </div>
          </button>

          {expanded === batch.id && (
            <div className="animate-fade-in border-t border-slate-100 p-4 sm:p-5">
              <div className="mb-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Card network batch</p>
                  <p className="font-heading text-sm font-bold text-navy-900">
                    ${batch.expectedTotal.toFixed(2)}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Internal ledger</p>
                  <p className="font-heading text-sm font-bold text-navy-900">
                    ${batch.receivedTotal.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="mb-4 rounded-xl bg-slate-50 p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Matched</span>
                  <span className="font-medium text-emerald-600">{batch.matchedCount}</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-sm">
                  <span className="text-slate-500">Mismatches</span>
                  <span
                    className={`font-medium ${
                      batch.mismatchCount > 0 ? "text-amber-600" : "text-emerald-600"
                    }`}
                  >
                    {batch.mismatchCount}
                  </span>
                </div>
                {batch.expectedTotal !== batch.receivedTotal && (
                  <div className="mt-1 flex items-center justify-between text-sm">
                    <span className="text-slate-500">Difference</span>
                    <span className="font-medium text-red-500">
                      ${(batch.expectedTotal - batch.receivedTotal).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

              {batch.mismatchCount > 0 && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                    <div>
                      <p className="text-xs font-medium text-amber-800">
                        {batch.mismatchCount} transaction{batch.mismatchCount > 1 ? "s" : ""} need review
                      </p>
                      <p className="mt-0.5 text-xs text-amber-700">
                        Possible causes: partial charge, disputed transaction, or timing delay.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Operator Dashboard ──────────────────────────────────────────────────────

function OperatorDashboard() {
  const [view, setView] = useState<"overview" | "reconciliation">("overview");

  return (
    <div className="animate-fade-in">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-navy-900 sm:text-3xl">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500">14 August 2026</p>
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={() => setView("overview")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              view === "overview"
                ? "bg-navy-800 text-white"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setView("reconciliation")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              view === "reconciliation"
                ? "bg-navy-800 text-white"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            }`}
          >
            Reconciliation
          </button>
        </div>
      </div>

      {view === "overview" ? (
        <>
          <div className="mb-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <MetricCard
              icon={Activity}
              label="Sessions today"
              value="47"
              change="+12%"
              changeType="positive"
            />
            <MetricCard
              icon={DollarSign}
              label="Revenue"
              value="$1,842"
              change="+8%"
              changeType="positive"
            />
            <MetricCard
              icon={Wallet}
              label="Settled"
              value="$1,628"
              change="88%"
              changeType="neutral"
            />
            <MetricCard
              icon={AlertCircle}
              label="Failed"
              value="2"
              change="-33%"
              changeType="positive"
            />
          </div>

          <SessionsTable />
        </>
      ) : (
        <ReconciliationView />
      )}
    </div>
  );
}

// ─── Main App ────────────────────────────────────────────────────────────────

export default function Home() {
  const [activeTab, setActiveTab] = useState<"driver" | "operator">("driver");
  const [driverStep, setDriverStep] = useState<
    "select" | "payment" | "charging" | "receipt"
  >("select");
  const [selectedCharger, setSelectedCharger] = useState<(typeof CHARGERS)[0] | null>(null);
  const [cards, setCards] = useState<Card[]>(SAVED_CARDS);
  const [selectedCardId, setSelectedCardId] = useState(SAVED_CARDS[0].id);

  const selectedCard = cards.find((c) => c.id === selectedCardId);

  const handleChargerSelect = useCallback((charger: (typeof CHARGERS)[0]) => {
    setSelectedCharger(charger);
    setDriverStep("payment");
  }, []);

  const handlePaymentConfirm = useCallback(() => {
    setDriverStep("charging");
  }, []);

  const handleSessionEnd = useCallback(() => {
    setDriverStep("receipt");
  }, []);

  const handleDone = useCallback(() => {
    setDriverStep("select");
    setSelectedCharger(null);
  }, []);

  const handleAddCard = useCallback((card: Card) => {
    setCards((prev) => [...prev, card]);
  }, []);

  const handleRemoveCard = useCallback((id: string) => {
    setCards((prev) => {
      const next = prev.filter((c) => c.id !== id);
      setSelectedCardId((current) => {
        if (current === id && next.length > 0) {
          return next[0].id;
        }
        return current;
      });
      return next;
    });
  }, []);

  return (
    <div className="mx-auto min-h-dvh w-full max-w-3xl px-4 py-5 sm:px-6 sm:py-8">
      <header className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy-800">
            <Zap className="h-5 w-5 text-gold-400" />
          </div>
          <span className="font-heading text-lg font-bold text-navy-900">BK Charging</span>
        </div>
      </header>

      <div className="mb-6">
        <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      <main>
        {activeTab === "driver" ? (
          <>
            {driverStep === "select" && (
              <ChargerSelect onSelect={handleChargerSelect} />
            )}
            {driverStep === "payment" && selectedCharger && (
              <Payment
                charger={selectedCharger}
                cards={cards}
                selectedCardId={selectedCardId}
                onSelectCard={setSelectedCardId}
                onAddCard={handleAddCard}
                onRemoveCard={handleRemoveCard}
                onConfirm={handlePaymentConfirm}
                onBack={() => setDriverStep("select")}
              />
            )}
            {driverStep === "charging" && selectedCharger && (
              <ActiveSession charger={selectedCharger} onEnd={handleSessionEnd} />
            )}
            {driverStep === "receipt" && selectedCharger && (
              <Receipt charger={selectedCharger} card={selectedCard} onDone={handleDone} />
            )}
          </>
        ) : (
          <OperatorDashboard />
        )}
      </main>

      <footer className="mt-12 border-t border-slate-100 pt-5 text-center">
        <p className="text-xs text-slate-400">
          BK Charging &middot; Making EV charging payments simple
        </p>
      </footer>
    </div>
  );
}
