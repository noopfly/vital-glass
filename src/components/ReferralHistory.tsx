import { useMemo, useState } from "react";
import {
  FileText,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Clock3,
  CalendarDays,
  X,
} from "lucide-react";
import { CenteredOverlay } from "@/components/ui/centered-overlay";

type ReferralStatus = "aktivs" | "izlietots" | "atcelts";

interface ReferralHistoryItem {
  id: string;
  date: string;
  title: string;
  specialty: string;
  facility: string;
  doctor: string;
  reason: string;
  validUntil: string;
  status: ReferralStatus;
  notes?: string;
  events: {
    id: string;
    label: string;
    date: string;
  }[];
}

const referrals: ReferralHistoryItem[] = [
  {
    id: "1",
    date: "2026-03-18",
    title: "E-nosūtījums uz kardiologa konsultāciju sirdsklauvju izvērtēšanai",
    specialty: "Kardiologs",
    facility: "Stradiņi",
    doctor: "Dr. Liepa",
    reason: "Sirdsklauves",
    validUntil: "2026-06-18",
    status: "aktivs",
    events: [
      { id: "e1", label: "Izveidots", date: "2026-03-18" },
      { id: "e2", label: "Pieejams pacientam", date: "2026-03-18" },
    ],
  },
  {
    id: "2",
    date: "2026-02-05",
    title: "Nosūtījums uz rentgenu pēc traumas izvērtēšanas",
    specialty: "Radiologs",
    facility: "Rīgas 1. slimnīca",
    doctor: "Dr. Ozols",
    reason: "Trauma",
    validUntil: "2026-05-05",
    status: "izlietots",
    events: [
      { id: "e1", label: "Izveidots", date: "2026-02-05" },
      { id: "e2", label: "Pieraksts veikts", date: "2026-02-06" },
      { id: "e3", label: "Izlietots", date: "2026-02-07" },
    ],
  },
  {
    id: "3",
    date: "2026-01-22",
    title: "Nosūtījums uz endokrinologa konsultāciju diabēta kontrolei",
    specialty: "Endokrinologs",
    facility: "VC4",
    doctor: "Dr. Kalniņa",
    reason: "Diabēta kontrole",
    validUntil: "2026-04-22",
    status: "atcelts",
    events: [
      { id: "e1", label: "Izveidots", date: "2026-01-22" },
      { id: "e2", label: "Atcelts", date: "2026-01-25" },
    ],
  },
  {
    id: "4",
    date: "2025-12-12",
    title: "Nosūtījums uz neirologa konsultāciju galvassāpju precizēšanai",
    specialty: "Neirologs",
    facility: "ARS",
    doctor: "Dr. Bērziņa",
    reason: "Hroniskas galvassāpes",
    validUntil: "2026-03-12",
    status: "izlietots",
    events: [
      { id: "e1", label: "Izveidots", date: "2025-12-12" },
      { id: "e2", label: "Pieejams pacientam", date: "2025-12-12" },
      { id: "e3", label: "Izlietots", date: "2025-12-18" },
    ],
  },
  {
    id: "5",
    date: "2025-11-03",
    title: "Nosūtījums uz dermatologa konsultāciju ādas izmaiņu novērtēšanai",
    specialty: "Dermatologs",
    facility: "Veselības centrs 4",
    doctor: "Dr. Ozoliņa",
    reason: "Ādas veidojums",
    validUntil: "2026-02-03",
    status: "aktivs",
    events: [
      { id: "e1", label: "Izveidots", date: "2025-11-03" },
      { id: "e2", label: "Pieejams pacientam", date: "2025-11-03" },
    ],
  },
];

const visibleReferrals = referrals.slice(0, 3);

const statusStyles = {
  aktivs: {
    icon: "text-[hsl(210,60%,45%)] border-[hsla(210,62%,82%,0.42)]",
    pill: "bg-[hsla(210,60%,92%,0.82)] text-[hsl(210,60%,45%)]",
    dot: "bg-[hsl(210,60%,45%)]",
  },
  izlietots: {
    icon: "text-[hsl(152,60%,35%)] border-[hsla(152,52%,80%,0.42)]",
    pill: "bg-[hsla(152,52%,90%,0.85)] text-[hsl(152,60%,35%)]",
    dot: "bg-[hsl(152,60%,35%)]",
  },
  atcelts: {
    icon: "text-[hsl(0,75%,55%)] border-[hsla(0,74%,82%,0.46)]",
    pill: "bg-[hsla(0,90%,92%,0.9)] text-[hsl(0,70%,45%)]",
    dot: "bg-[hsl(0,70%,45%)]",
  },
};

const statusLabel: Record<ReferralStatus, string> = {
  aktivs: "Aktīvs",
  izlietots: "Izlietots",
  atcelts: "Atcelts",
};

const StatusIcon = ({
  status,
  className,
}: {
  status: ReferralStatus;
  className?: string;
}) => {
  if (status === "aktivs") return <Clock3 size={13} className={className} />;
  if (status === "izlietots") {
    return <CheckCircle2 size={13} className={className} />;
  }
  return <XCircle size={13} className={className} />;
};

const ReferralTimeline = ({ referral }: { referral: ReferralHistoryItem }) => {
  const sortedEvents = useMemo(
  () =>
    [...referral.events].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    ),
  [referral.events]
);

  const style = statusStyles[referral.status];

  return (
    <div>
      <p className="mb-3 text-[12px] font-semibold text-[hsl(222,28%,20%)]">
        Notikumu vēsture
      </p>

      <div className="rounded-2xl border border-[hsl(214,22%,88%)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,250,253,0.94))] px-4 py-4">
        <div className="space-y-0">
          {sortedEvents.map((event, index) => {
            const isLast = index === sortedEvents.length - 1;

            return (
              <div key={event.id} className="grid grid-cols-[16px_1fr] gap-3">
                <div className="relative flex justify-center">
                  <span
                    className={`relative z-10 mt-1 h-2.5 w-2.5 rounded-full ${style.dot}`}
                  />
                  {!isLast && (
<span className="absolute top-3 bottom-0 w-px bg-[hsl(214,22%,84%)]" />                  )}
                </div>

                <div className={isLast ? "" : "pb-4"}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-[12px] font-semibold text-[hsl(222,28%,20%)]">
                      {event.label}
                    </p>
                    <span className="rounded-full bg-[hsl(210,60%,96%)] px-2.5 py-1 text-[10px] font-medium text-[hsl(210,38%,42%)]">
                      {event.date}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const ReferralDetailOverlay = ({
  referral,
  onClose,
}: {
  referral: ReferralHistoryItem;
  onClose: () => void;
}) => {
  const style = statusStyles[referral.status];

  return (
    <CenteredOverlay
      onClose={onClose}
      overlayClassName="bg-[rgba(241,245,249,0.78)] backdrop-blur-[10px]"
      contentClassName="max-w-3xl"
    >
      <div className="relative mx-auto w-full overflow-hidden rounded-[26px] border border-[hsl(214,22%,88%)] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.14)]">
        <div className="border-b border-[hsl(214,22%,88%)] px-6 py-5">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-[hsl(210,24%,95%)] text-[hsl(215,14%,55%)] transition hover:text-[hsl(215,22%,28%)]"
            aria-label="Aizvērt"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-3 pr-12">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-2xl border bg-[radial-gradient(circle_at_top,hsla(0,100%,100%,0.98),hsla(210,40%,97%,0.9)_52%,hsla(210,28%,95%,0.78))] shadow-[inset_0_1px_0_hsla(0,0%,100%,0.6)] ${style.icon}`}
            >
              <StatusIcon status={referral.status} />
            </div>

            <div>
              <h3 className="text-base font-semibold text-[hsl(222,28%,20%)]">
                {referral.title}
              </h3>
              <p className="text-[12px] text-[hsl(214,14%,42%)]">
                {referral.specialty} • {referral.facility}
              </p>
            </div>
          </div>
        </div>

        <div className="max-h-[78vh] space-y-4 overflow-y-auto px-6 py-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-[hsl(214,22%,88%)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,250,253,0.94))] p-3.5">
              <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-heading">
                Statuss
              </p>
              <p
                className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-[10px] font-medium ${style.pill}`}
              >
                {statusLabel[referral.status]}
              </p>
            </div>

            <div className="rounded-2xl border border-[hsl(214,22%,88%)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,250,253,0.94))] p-3.5">
              <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-heading">
                Datums
              </p>
              <p className="mt-1 text-[12px] font-semibold text-[hsl(222,28%,20%)]">
                {referral.date}
              </p>
            </div>

            <div className="rounded-2xl border border-[hsl(214,22%,88%)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,250,253,0.94))] p-3.5">
              <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-heading">
                Derīgs līdz
              </p>
              <p className="mt-1 text-[12px] font-semibold text-[hsl(222,28%,20%)]">
                {referral.validUntil}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-[hsl(214,22%,88%)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,250,253,0.94))] p-3.5">
            <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-heading">
              Iemesls
            </p>
            <p className="mt-2 text-[12px] leading-5 text-[hsl(214,14%,42%)]">
              {referral.reason}
            </p>
          </div>

          <ReferralTimeline referral={referral} />
        </div>
      </div>
    </CenteredOverlay>
  );
};

const ReferralList = ({
  items,
  onSelect,
}: {
  items: ReferralHistoryItem[];
  onSelect: (referral: ReferralHistoryItem) => void;
}) => {
  return (
    <div className="space-y-2">
      {items.map((referral) => {
        const style = statusStyles[referral.status];

        return (
          <button
            key={referral.id}
            type="button"
            onClick={() => onSelect(referral)}
            className="flex w-full items-start justify-between gap-3 rounded-xl border border-white/60 bg-white/50 px-3 py-2 text-left backdrop-blur-sm transition hover:bg-white/70"
          >
            <div className="flex min-w-0 flex-1 items-start gap-2.5">
              <div
                className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border bg-[radial-gradient(circle_at_top,hsla(0,100%,100%,0.96),hsla(210,38%,97%,0.84)_52%,hsla(210,28%,94%,0.7))] shadow-[inset_0_1px_0_hsla(0,0%,100%,0.62)] ${style.icon}`}
              >
                <StatusIcon status={referral.status} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-semibold leading-[1.35] text-text-dark">
                  {referral.title}
                </p>

                <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] leading-4 text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays size={10} />
                    {referral.date}
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1">
                    {referral.facility}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <span
                className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${style.pill}`}
              >
                {statusLabel[referral.status]}
              </span>
              <ArrowRight size={12} className="mt-0.5 text-heading" />
            </div>
          </button>
        );
      })}
    </div>
  );
};

const AllReferralsOverlay = ({
  items,
  onClose,
  onSelect,
}: {
  items: ReferralHistoryItem[];
  onClose: () => void;
  onSelect: (referral: ReferralHistoryItem) => void;
}) => {
  return (
    <CenteredOverlay
      onClose={onClose}
      overlayClassName="bg-[rgba(241,245,249,0.78)] backdrop-blur-[10px]"
      contentClassName="max-w-4xl"
    >
      <div className="relative mx-auto w-full overflow-hidden rounded-[26px] border border-[hsl(214,22%,88%)] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.14)]">
        <div className="border-b border-[hsl(214,22%,88%)] px-6 py-5">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-[hsl(210,24%,95%)] text-[hsl(215,14%,55%)] transition hover:text-[hsl(215,22%,28%)]"
            aria-label="Aizvērt"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-3 pr-12">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[hsla(210,62%,82%,0.42)] bg-[radial-gradient(circle_at_top,hsla(0,100%,100%,0.98),hsla(210,92%,96%,0.96)_48%,hsla(210,78%,92%,0.88))] text-[hsl(210,60%,45%)] shadow-[0_0_0_1px_hsla(0,100%,100%,0.22),0_12px_30px_hsla(210,80%,76%,0.18)]">
              <FileText size={18} />
            </div>

            <div>
              <h3 className="text-base font-semibold text-[hsl(222,28%,20%)]">
                Visi e-nosūtījumi
              </h3>
              <p className="text-[12px] text-[hsl(214,14%,42%)]">
                Pilns nosūtījumu saraksts ar detalizētu informāciju.
              </p>
            </div>
          </div>
        </div>

        <div className="max-h-[78vh] overflow-y-auto px-6 py-5">
          <ReferralList items={items} onSelect={onSelect} />
        </div>
      </div>
    </CenteredOverlay>
  );
};

const ReferralHistory = () => {
  const [selectedReferral, setSelectedReferral] =
    useState<ReferralHistoryItem | null>(null);
  const [showAll, setShowAll] = useState(false);

  return (
    <>
      <section className="flex h-full w-full flex-col overflow-hidden rounded-lg border border-[hsl(214,22%,88%)] bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3 border-b border-[hsl(214,22%,88%)] pb-3.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[hsla(210,62%,82%,0.42)] bg-[radial-gradient(circle_at_top,hsla(0,100%,100%,0.98),hsla(210,92%,96%,0.96)_48%,hsla(210,78%,92%,0.88))] text-[hsl(210,60%,45%)] shadow-[0_0_0_1px_hsla(0,100%,100%,0.22),0_12px_30px_hsla(210,80%,76%,0.18)]">
            <FileText size={18} />
          </div>

          <div>
            <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-[hsl(210,60%,45%)]">
              E-nosūtījumi
            </p>
            <p className="text-[10px] text-heading">
              Aktīvie un vēsturiskie nosūtījumi
            </p>
          </div>
        </div>

        <div className="mt-3 flex-1 overflow-y-auto pr-1">
          <ReferralList
            items={visibleReferrals}
            onSelect={(referral) => setSelectedReferral(referral)}
          />
        </div>

        <div className="mt-3 border-t border-[hsl(214,22%,88%)] pt-3 text-center">
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="text-[12px] font-medium text-[hsl(210,78%,56%)] transition hover:opacity-80"
          >
            Skatīt visus e-nosūtījumus →
          </button>
        </div>
      </section>

      {selectedReferral && (
        <ReferralDetailOverlay
          referral={selectedReferral}
          onClose={() => setSelectedReferral(null)}
        />
      )}

      {showAll && (
        <AllReferralsOverlay
          items={referrals}
          onClose={() => setShowAll(false)}
          onSelect={(referral) => {
            setShowAll(false);
            setSelectedReferral(referral);
          }}
        />
      )}
    </>
  );
};

export default ReferralHistory;
