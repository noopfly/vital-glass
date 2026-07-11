import { useMemo, useState } from "react";
import {
  CircleCheck,
  ChevronRight,
  TriangleAlert,
  X,
} from "lucide-react";
import { CenteredOverlay } from "@/components/ui/centered-overlay";
import { DashboardCardHeader } from "@/components/DashboardCardHeader";
import { DashboardListFooter } from "@/components/DashboardListFooter";

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
    facility: "PSKUS",
    doctor: "Dr. Liepa",
    reason: "Sirdsklauves",
    validUntil: "2026-06-18",
    status: "aktivs",
    events: [
      { id: "e1", label: "Izveidots nosūtījums", date: "2026-03-18" },
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
      { id: "e1", label: "Izveidots nosūtījums", date: "2026-02-05" },
      { id: "e2", label: "Veikts pieraksts", date: "2026-02-06" },
      { id: "e3", label: "Izlietots nosūtījums", date: "2026-02-07" },
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
      { id: "e1", label: "Izveidots nosūtījums", date: "2026-01-22" },
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
      { id: "e1", label: "Izveidots nosūtījums", date: "2025-12-12" },
      { id: "e3", label: "Izlietots nosūtījums", date: "2025-12-18" },
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
      { id: "e1", label: "Izveidots nosūtījums", date: "2025-11-03" },
    ],
  },
];

const visibleReferrals = referrals.slice(0, 3);

const statusStyles = {
  aktivs: {
    Icon: CircleCheck,
    textClass: "text-status-normal",
    badgeClass: "border-[hsl(152,34%,78%)] bg-[hsl(152,42%,97%)]",
    dot: "bg-[hsl(152,42%,34%)]",
  },
  izlietots: {
    Icon: CircleCheck,
    textClass: "text-[hsl(220,18%,44%)]",
    badgeClass: "border-[hsl(214,22%,84%)] bg-[hsl(214,22%,95%)]",
    dot: "bg-[hsl(220,18%,44%)]",
  },
  atcelts: {
    Icon: TriangleAlert,
    textClass: "text-status-critical",
    badgeClass: "border-[hsl(0,58%,84%)] bg-[hsl(0,72%,98%)]",
    dot: "bg-[hsl(0,54%,52%)]",
  },
};

const statusLabel: Record<ReferralStatus, string> = {
  aktivs: "Aktīvs",
  izlietots: "Izlietots",
  atcelts: "Atcelts",
};

const ReferralStatusPill = ({ status }: { status: ReferralStatus }) => {
  const style = statusStyles[status];
  const StatusIcon = style.Icon;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-1.5 py-0 text-xs font-semibold leading-4 ${style.textClass} ${style.badgeClass}`}
    >
      <StatusIcon size={12} strokeWidth={2.1} aria-hidden="true" />
      {statusLabel[status]}
    </span>
  );
};

const ReferralTimeline = ({ referral }: { referral: ReferralHistoryItem }) => {
  const sortedEvents = useMemo(
    () =>
      [...referral.events].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      ),
    [referral.events],
  );
  const style = statusStyles[referral.status];

  return (
    <div>
      <p className="mb-2.5 text-sm font-semibold text-[hsl(222,28%,20%)]">
        Notikumu vēsture
      </p>

      <div className="rounded-[10px] border border-[hsl(214,22%,88%)] bg-[hsl(214,20%,98%)] px-4 py-4">
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
                    <span className="absolute bottom-0 top-3 w-px bg-[hsl(214,22%,84%)]" />
                  )}
                </div>

                <div className={isLast ? "" : "pb-4"}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-[hsl(222,28%,20%)]">
                      {event.label}
                    </p>
                    <span className="rounded-full bg-[hsl(214,22%,95%)] px-2.5 py-1 text-xs text-[hsl(220,24%,34%)] tabular-nums">
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
      <div className="relative mx-auto w-full overflow-hidden rounded-[14px] border border-[hsl(214,22%,88%)] bg-white shadow-[0_24px_64px_rgba(15,23,42,0.12)]">
        <div className="border-b border-[hsl(214,22%,88%)] px-6 py-5">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-[10px] bg-[hsl(214,20%,96%)] text-[hsl(215,14%,55%)] transition hover:text-[hsl(215,22%,28%)]"
            aria-label="Aizvērt"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="pr-12">
            <h3 className="text-xl font-semibold tracking-[-0.035em] text-[hsl(222,28%,20%)]">
              {referral.title}
            </h3>
            <p className="mt-1 text-sm leading-5 text-[hsl(214,14%,42%)]">
              {referral.specialty} · {referral.facility}
            </p>
          </div>
        </div>

        <div className="max-h-[78vh] space-y-4 overflow-y-auto px-6 py-5">
          <div className="overflow-hidden rounded-[10px] border border-[hsl(214,22%,88%)] bg-white">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3">
              <div className="border-b border-[hsl(214,22%,88%)] px-4 py-3.5 sm:border-r lg:border-b-0">
                <p className="text-sm font-semibold text-[hsl(222,28%,20%)]">
                  Statuss
                </p>
                <div className="mt-2">
                  <ReferralStatusPill status={referral.status} />
                </div>
              </div>

              <div className="border-b border-[hsl(214,22%,88%)] px-4 py-3.5 lg:border-b-0 lg:border-r">
                <p className="text-sm font-semibold text-[hsl(222,28%,20%)]">
                  Datums
                </p>
                <p className="mt-2 text-sm text-text-dark tabular-nums">
                  {referral.date}
                </p>
              </div>

              <div className="px-4 py-3.5 sm:col-span-2 lg:col-span-1">
                <p className="text-sm font-semibold text-[hsl(222,28%,20%)]">
                  Derīgs līdz
                </p>
                <p className="mt-2 text-sm text-text-dark tabular-nums">
                  {referral.validUntil}
                </p>
              </div>
            </div>

            <div className="border-t border-[hsl(214,22%,88%)] px-4 py-3.5">
              <p className="text-sm font-semibold text-[hsl(222,28%,20%)]">
                Iemesls
              </p>
              <p className="mt-2 text-sm leading-5 text-[hsl(214,14%,42%)]">
                {referral.reason}
              </p>
            </div>
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
  onOpenAll,
  remainingCount = 0,
  compact = false,
}: {
  items: ReferralHistoryItem[];
  onSelect: (referral: ReferralHistoryItem) => void;
  onOpenAll?: () => void;
  remainingCount?: number;
  compact?: boolean;
}) => {
  return (
    <div
      className={
        compact
          ? "overflow-hidden rounded-[10px] border border-[hsl(214,22%,88%)] bg-white divide-y divide-[hsl(214,22%,90%)]"
          : "space-y-2.5"
      }
    >
      {items.map((referral) => {
        return (
          <button
            key={referral.id}
            type="button"
            onClick={() => onSelect(referral)}
            className={
              compact
                ? "flex w-full items-start justify-between gap-3 bg-white px-4 py-4 text-left transition hover:bg-[hsl(214,20%,99%)]"
                : "flex w-full items-start justify-between gap-3 rounded-[10px] border border-[hsl(214,20%,90%)] bg-[hsl(214,20%,98%)] px-3 py-2.5 text-left transition hover:bg-white"
            }
          >
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold leading-4 text-text-dark">
                {referral.title}
              </p>

              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs leading-4 text-muted-foreground">
                <span className="tabular-nums">{referral.date}</span>
                <span aria-hidden="true">·</span>
                <span>{referral.facility}</span>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <ReferralStatusPill status={referral.status} />
              <ChevronRight size={16} className="text-heading" aria-hidden="true" />
            </div>
          </button>
        );
      })}
      {onOpenAll && remainingCount > 0 ? (
        <DashboardListFooter
          label={`Vēl ${remainingCount} nosūtījumi`}
          onClick={onOpenAll}
          ariaLabel={`Skatīt vēl ${remainingCount} e-nosūtījumus`}
        />
      ) : null}
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
      overlayClassName="bg-[rgba(15,23,42,0.32)] backdrop-blur-sm motion-safe:animate-in motion-safe:fade-in motion-safe:duration-200"
      contentClassName="max-w-4xl"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label="E-nosūtījumi"
        className="mx-auto w-full overflow-hidden rounded-[12px] border border-[hsl(214,22%,88%)] bg-white shadow-[0_28px_80px_rgba(15,23,42,0.16)] motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-200"
      >
        <div className="border-b border-[hsl(214,22%,90%)] px-5 py-5 sm:px-6">
          <DashboardCardHeader
            title="E-nosūtījumi"
            infoLabel="Informācija par e-nosūtījumiem"
            infoDescription="Aktīvie un vēsturiskie e-nosūtījumi"
          >
            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[6px] text-[hsl(215,14%,42%)] transition hover:bg-[hsl(210,24%,96%)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(214,45%,54%)]"
              aria-label="Aizvērt e-nosūtījumus"
            >
              <X size={18} />
            </button>
          </DashboardCardHeader>
        </div>

        <div className="max-h-[72vh] overflow-y-auto px-5 py-5 sm:px-6">
          <ReferralList items={items} onSelect={onSelect} compact />
        </div>
      </section>
    </CenteredOverlay>
  );
};

const ReferralHistory = () => {
  const [selectedReferral, setSelectedReferral] =
    useState<ReferralHistoryItem | null>(null);
  const [showAll, setShowAll] = useState(false);

  return (
    <>
      <section className="clinical-panel flex h-full w-full flex-col">
        <DashboardCardHeader
          title="E-nosūtījumi"
          infoLabel="Informācija par e-nosūtījumiem"
          infoDescription="Aktīvie un vēsturiskie e-nosūtījumi"
        />

        <div className="mt-3 flex-1 overflow-y-auto pr-1">
          <ReferralList
            items={visibleReferrals}
            compact
            onSelect={(referral) => setSelectedReferral(referral)}
            onOpenAll={() => setShowAll(true)}
            remainingCount={referrals.length - visibleReferrals.length}
          />
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
