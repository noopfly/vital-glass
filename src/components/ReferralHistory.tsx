import { useMemo, useState } from "react";
import { ChevronRight, X } from "lucide-react";
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
    description: string;
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
      {
        id: "e1",
        label: "Izveidots nosūtījums",
        date: "2026-03-18",
        description: "Nosūtījums ir izveidots.",
      },
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
      {
        id: "e1",
        label: "Izveidots nosūtījums",
        date: "2026-02-05",
        description: "Nosūtījums ir izveidots.",
      },
      {
        id: "e2",
        label: "Veikts pieraksts",
        date: "2026-02-06",
        description: "Pieraksts pie speciālista ir veikts.",
      },
      {
        id: "e3",
        label: "Izlietots nosūtījums",
        date: "2026-02-07",
        description: "Nosūtījums ir izlietots.",
      },
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
      {
        id: "e1",
        label: "Izveidots nosūtījums",
        date: "2026-01-22",
        description: "Nosūtījums ir izveidots.",
      },
      {
        id: "e2",
        label: "Atcelts",
        date: "2026-01-25",
        description: "Nosūtījums tika atcelts.",
      },
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
      {
        id: "e1",
        label: "Izveidots nosūtījums",
        date: "2025-12-12",
        description: "Nosūtījums ir izveidots.",
      },
      {
        id: "e3",
        label: "Izlietots nosūtījums",
        date: "2025-12-18",
        description: "Nosūtījums ir izlietots.",
      },
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
      {
        id: "e1",
        label: "Izveidots nosūtījums",
        date: "2025-11-03",
        description: "Nosūtījums ir izveidots.",
      },
    ],
  },
];

const visibleReferrals = referrals.slice(0, 3);

const statusStyles = {
  aktivs: {
    badgeClass:
      "border-[hsl(152,34%,78%)] bg-[hsl(152,42%,97%)] text-[hsl(152,38%,31%)]",
    dot: "bg-[hsl(152,42%,34%)]",
  },
  izlietots: {
    badgeClass:
      "border-[hsl(214,22%,84%)] bg-[hsl(214,22%,96%)] text-[hsl(220,18%,44%)]",
    dot: "bg-[hsl(220,18%,44%)]",
  },
  atcelts: {
    badgeClass:
      "border-[hsl(38,30%,80%)] bg-[hsl(40,52%,94%)] text-[hsl(34,50%,36%)]",
    dot: "bg-[hsl(34,50%,36%)]",
  },
};

const statusLabel: Record<ReferralStatus, string> = {
  aktivs: "Aktīvs",
  izlietots: "Izlietots",
  atcelts: "Atcelts",
};

const ReferralStatusPill = ({ status }: { status: ReferralStatus }) => {
  const style = statusStyles[status];

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${style.badgeClass}`}
    >
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

  return (
    <section aria-labelledby="referral-history-title">
      <h4
        id="referral-history-title"
        className="text-sm font-semibold text-text-dark"
      >
        Notikumu vēsture
      </h4>

      <div className="mt-4">
        {sortedEvents.map((event, index) => {
          const isLast = index === sortedEvents.length - 1;
          const isNewest = index === 0;
          const eventDotClass =
            event.label === "Atcelts"
              ? "bg-status-critical ring-[hsl(0,72%,94%)]"
              : event.label === "Izlietots nosūtījums"
                ? "bg-[hsl(220,18%,44%)]"
                : "bg-[hsl(214,22%,78%)]";

          return (
            <div
              key={event.id}
              className={`grid grid-cols-[20px_minmax(0,1fr)_auto] gap-x-3 ${
                index === 0 ? "" : "pt-8"
              }`}
            >
              <div className="relative flex justify-center">
                <span
                  className={`relative z-10 mt-1.5 h-3 w-3 rounded-full ${isNewest ? "ring-4" : ""} ${eventDotClass}`}
                  data-timeline-marker
                  data-current={isNewest ? "true" : undefined}
                  aria-hidden="true"
                />
                {!isLast ? (
                  <span
                    className="absolute top-3 bottom-[-44px] w-px bg-[hsl(214,22%,84%)]"
                    aria-hidden="true"
                  />
                ) : null}
              </div>

              <div className="min-w-0">
                <p className="text-sm font-semibold leading-5 text-text-dark">
                  {event.label}
                </p>
              </div>

              <time className="pt-0.5 text-xs leading-4 text-heading tabular-nums">
                {event.date}
              </time>
            </div>
          );
        })}
      </div>
    </section>
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
      overlayClassName="bg-[rgba(15,23,42,0.32)] backdrop-blur-sm motion-safe:animate-in motion-safe:fade-in motion-safe:duration-200"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="referral-detail-title"
        className="mx-auto max-h-[calc(100vh-3rem)] w-full max-w-5xl overflow-y-auto rounded-[12px] border border-[hsl(214,22%,88%)] bg-white shadow-[0_28px_80px_rgba(15,23,42,0.16)] motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-200"
      >
        <header className="flex items-start justify-between gap-4 bg-white px-5 py-5 sm:px-6">
          <div className="flex min-w-0 items-start gap-3">
            <span
              className={`mt-1 h-10 w-1 shrink-0 rounded-full ${style.dot}`}
              aria-hidden="true"
            />
            <div className="min-w-0">
              <h3
                id="referral-detail-title"
                className="text-3xl font-semibold tracking-[-0.035em] text-text-dark"
              >
                {referral.title}
              </h3>
              <p className="text-sm leading-5 text-heading">
                {referral.specialty} · {referral.facility}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[6px] text-[hsl(215,18%,42%)] transition-colors hover:bg-[hsl(210,24%,96%)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(214,45%,54%)] focus-visible:ring-offset-2"
            aria-label="Aizvērt"
          >
            <X size={25} strokeWidth={1.8} />
          </button>
        </header>

        <div className="grid border-b border-[hsl(214,22%,90%)] bg-white sm:grid-cols-3">
          <div className="px-5 py-4 sm:px-6">
            <p className="text-xs font-semibold text-[hsl(215,18%,38%)]">
              Statuss
            </p>
            <div className="mt-2">
              <ReferralStatusPill status={referral.status} />
            </div>
          </div>

          <div className="px-5 py-4 sm:px-6">
            <p className="text-xs font-semibold text-[hsl(215,18%,38%)]">
              Datums
            </p>
            <p className="mt-1.5 text-xl font-semibold leading-tight tracking-[-0.04em] text-text-dark tabular-nums">
              {referral.date}
            </p>
          </div>

          <div className="px-5 py-4 sm:px-6">
            <p className="text-xs font-semibold text-[hsl(215,18%,38%)]">
              Derīgs līdz
            </p>
            <p className="mt-1.5 text-xl font-semibold leading-tight tracking-[-0.04em] text-text-dark tabular-nums">
              {referral.validUntil}
            </p>
          </div>
        </div>

        <div className="divide-y divide-[hsl(214,22%,90%)]">
          <section className="px-5 py-5 sm:px-6">
            <dl className="space-y-1">
              <dt className="text-xs font-semibold text-[hsl(215,18%,38%)]">
                Iemesls
              </dt>
              <dd className="text-sm leading-5 text-heading">
                {referral.reason}
              </dd>
            </dl>
          </section>

          <section className="px-5 py-5 sm:px-6">
            <ReferralTimeline referral={referral} />
          </section>
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
          ? "clinical-list"
          : "divide-y divide-[hsl(214,22%,90%)] bg-white"
      }
    >
      {items.map((referral) => {
        const statusStyle = statusStyles[referral.status];
        const facilityStartsNewLine = referral.facility.length > 14;

        return (
          <button
            key={referral.id}
            type="button"
            onClick={() => onSelect(referral)}
            className={
              compact
                ? "grid w-full grid-cols-[4px_minmax(0,1fr)] items-start gap-x-3 bg-white px-4 py-3 text-left transition-colors duration-200 hover:bg-[hsl(214,20%,99%)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[hsl(214,45%,54%)]"
                : "grid w-full grid-cols-[4px_minmax(0,1fr)] items-start gap-x-3 bg-white px-1 py-4 text-left transition-colors duration-200 hover:bg-[hsl(214,20%,99%)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[hsl(214,45%,54%)]"
            }
          >
            <span
              className={`mt-0.5 h-9 w-1 rounded-full ${statusStyle.dot}`}
              aria-hidden="true"
            />

            <div className="min-w-0">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-3">
                <p className="text-xs font-semibold leading-4 text-text-dark">
                  {referral.title}
                </p>

                <div className="flex shrink-0 items-center gap-2 pt-0.5">
                  <ReferralStatusPill status={referral.status} />
                  <ChevronRight size={16} className="text-heading" aria-hidden="true" />
                </div>

                <div className="col-span-2 mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs leading-4 text-heading">
                  <span className="shrink-0 tabular-nums">{referral.date}</span>
                  <span aria-hidden="true">·</span>
                  <span>{referral.specialty}</span>
                  {facilityStartsNewLine ? (
                    <span className="basis-full">{referral.facility}</span>
                  ) : (
                    <>
                      <span aria-hidden="true">·</span>
                      <span>{referral.facility}</span>
                    </>
                  )}
                </div>
              </div>
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
          <ReferralList items={items} onSelect={onSelect} />
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
