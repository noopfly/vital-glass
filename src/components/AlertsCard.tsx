import { useState } from "react";
import { AlertTriangle, Calendar, FlaskConical, X } from "lucide-react";
import { CenteredOverlay } from "@/components/ui/centered-overlay";

interface AlertItem {
  id: string;
  title: string;
  description: string;
  date: string;
  type: "critical" | "warning" | "info";
  details: string[];
}

const alerts: AlertItem[] = [
  {
    id: "1",
    title: "Nokavēta vizīte",
    description: "Kardiologa konsultācija pie Dr. Bērziņa",
    date: "10. apr.",
    type: "critical",
    details: [
      "Pacients neieradas uz planoto kardiologa konsultaciju.",
      "Nepieciesama parplanosana tuvako 3 darba dienu laika.",
      "Ieteicams sazvanit pacientu un apstiprinat jaunu laiku.",
    ],
  },
  {
    id: "2",
    title: "Izmainīts laboratorijas rezultāts",
    description: "Kreatinīns: 2.4 mg/dL (pārsniedz normu)",
    date: "14. apr.",
    type: "warning",
    details: [
      "Kreatinīna raditajs ir virs references intervala.",
      "Ieteicama atkārtota nieru funkcijas kontrole 48 stundu laika.",
      "Ja saglabajas simptomi, nepieciesama arsta konsultacija.",
    ],
  },
  {
    id: "3",
    title: "Izmainīts laboratorijas rezultāts",
    description: "HbA1c: 9.2% (pārsniedz normu)",
    date: "14. apr.",
    type: "warning",
    details: [
      "Glikemijas kontrole nav pietiekama.",
      "Japarverte esosa terapija un uztura rekomendacijas.",
      "Ieteicams nozimet endokrinologa vai gimenas arsta kontroles viziti.",
    ],
  },
  {
    id: "4",
    title: "Plānotas asins analīzes",
    description: "Jānodod asins analīzes Centrālajā Laboratorijā",
    date: "22. apr.",
    type: "info",
    details: [
      "Planota laboratoriska kontrole pilnam asinsainas un bioķimijas panelim.",
      "Pacientam jaierodas tuksa dusa, ja vien nav citu noradijumu.",
      "Rezultati tiks pievienoti profilam pec apstrades.",
    ],
  },
];

const visibleAlerts = alerts.slice(0, 3);

const iconStyles = {
  critical:
    "bg-transparent text-[hsl(0,75%,55%)] border-[hsla(0,74%,82%,0.46)] shadow-[0_0_0_1px_hsla(0,100%,100%,0.18),0_10px_24px_hsla(0,85%,78%,0.2)]",
  warning:
    "bg-transparent text-[hsl(33,85%,45%)] border-[hsla(36,82%,80%,0.44)] shadow-[0_0_0_1px_hsla(0,100%,100%,0.16),0_10px_24px_hsla(36,88%,76%,0.18)]",
  info:
    "bg-transparent text-[hsl(210,60%,45%)] border-[hsla(210,62%,82%,0.42)] shadow-[0_0_0_1px_hsla(0,100%,100%,0.16),0_10px_24px_hsla(210,82%,78%,0.18)]",
};

const dateStyles = {
  critical:
    "bg-[hsla(0,90%,92%,0.8)] text-[hsl(0,70%,45%)]",
  warning:
    "bg-[hsla(36,100%,92%,0.7)] text-[hsl(33,85%,45%)]",
  info:
    "bg-[hsla(210,60%,92%,0.7)] text-[hsl(210,60%,45%)]",
};

const pillStyles = {
  critical:
    "bg-[hsla(0,90%,92%,0.9)] text-[hsl(0,70%,45%)]",
  warning:
    "bg-[hsla(36,100%,92%,0.85)] text-[hsl(33,85%,45%)]",
  info:
    "bg-[hsla(210,60%,92%,0.85)] text-[hsl(210,60%,45%)]",
};

const iconMap = {
  critical: AlertTriangle,
  warning: FlaskConical,
  info: Calendar,
};


const AlertsCard = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <section className="flex h-full w-full flex-col overflow-hidden rounded-lg border border-[hsl(214,22%,88%)] bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-[hsl(214,22%,88%)] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[hsla(0,74%,82%,0.44)] bg-[radial-gradient(circle_at_top,hsla(0,100%,100%,0.98),hsla(0,92%,96%,0.96)_48%,hsla(0,78%,92%,0.88))] text-[hsl(0,75%,55%)] shadow-[0_0_0_1px_hsla(0,100%,100%,0.22),0_12px_30px_hsla(0,80%,76%,0.22)]">
              <AlertTriangle size={20} />
            </div>
            <div>
              <p className="text-[14px] font-semibold uppercase tracking-[0.12em] text-[hsl(0,75%,55%)]">
                Brīdinājumi
              </p>
              <p className="text-xs text-heading">Tuvākās 2 nedēļas</p>
            </div>
          </div>

          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[hsl(0,80%,60%)] text-sm font-semibold text-white shadow-md">
            {alerts.length}
          </div>
        </div>

        <div className="mt-4 space-y-2.5">
          {visibleAlerts.map((alert) => {
            const Icon = iconMap[alert.type];

            return (
              <div
                key={alert.id}
                className="flex items-center justify-between rounded-xl border border-white/60 bg-white/50 px-4 py-2.5 backdrop-blur-sm transition hover:bg-white/70"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-xl border bg-[radial-gradient(circle_at_top,hsla(0,100%,100%,0.96),hsla(210,38%,97%,0.84)_52%,hsla(210,28%,94%,0.7))] shadow-[inset_0_1px_0_hsla(0,0%,100%,0.62)] ${iconStyles[alert.type]}`}
                  >
                    <Icon size={16} />
                  </div>

                  <div>
                    <p className="text-[13px] font-semibold text-text-dark">
                      {alert.title}
                    </p>
                    <p className="text-[11px] leading-4 text-muted-foreground">
                      {alert.description}
                    </p>
                  </div>
                </div>

                <span
                  className={`ml-4 shrink-0 rounded-full px-3 py-1 text-[11px] font-medium ${dateStyles[alert.type]}`}
                >
                  {alert.date}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-auto border-t border-[hsl(214,22%,88%)] pt-4 text-center">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="text-sm font-medium text-[hsl(210,78%,56%)] transition hover:opacity-80"
          >
            Skatīt visus brīdinājumus →
          </button>
        </div>
      </section>

      {isOpen && (
        <CenteredOverlay
          onClose={() => setIsOpen(false)}
          overlayClassName="bg-[rgba(241,245,249,0.78)] backdrop-blur-[10px]"
          contentClassName="max-w-3xl"
        >
          <div className="relative mx-auto w-full overflow-hidden rounded-[26px] border border-[hsl(214,22%,88%)] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.14)]">
            <div className="border-b border-[hsl(214,22%,88%)] px-6 py-5">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-[hsl(210,24%,95%)] text-[hsl(215,14%,55%)] transition hover:text-[hsl(215,22%,28%)]"
                aria-label="Aizvert"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-3 pr-12">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[hsla(0,74%,82%,0.44)] bg-[radial-gradient(circle_at_top,hsla(0,100%,100%,0.98),hsla(0,92%,96%,0.96)_48%,hsla(0,78%,92%,0.88))] text-[hsl(0,75%,55%)] shadow-[0_0_0_1px_hsla(0,100%,100%,0.22),0_12px_30px_hsla(0,80%,76%,0.18)]">
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[hsl(222,28%,20%)]">
                    Visi brīdinājumi
                  </h3>
                  <p className="text-sm text-[hsl(214,14%,42%)]">
                    Paplašināta informācija par aktīviem brīdinājumiem un plānotiem notikumiem.
                  </p>
                </div>
              </div>
            </div>

            <div className="max-h-[78vh] space-y-3 overflow-y-auto px-6 py-5">
              {alerts.map((alert) => {
                const Icon = iconMap[alert.type];

                return (
                  <div
                    key={alert.id}
                    className="rounded-2xl border border-[hsl(214,22%,88%)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,250,253,0.94))] p-4 shadow-[0_8px_20px_rgba(148,163,184,0.08)]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-2xl border bg-[radial-gradient(circle_at_top,hsla(0,100%,100%,0.98),hsla(210,40%,97%,0.9)_52%,hsla(210,28%,95%,0.78))] shadow-[inset_0_1px_0_hsla(0,0%,100%,0.6)] ${iconStyles[alert.type]}`}
                        >
                          <Icon size={18} />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold text-[hsl(222,28%,20%)]">
                              {alert.title}
                            </p>
                            
                          </div>
                          <p className="mt-1 text-sm text-[hsl(214,14%,42%)]">
                            {alert.description}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-medium ${dateStyles[alert.type]}`}
                      >
                        {alert.date}
                      </span>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        </CenteredOverlay>
      )}
    </>
  );
};

export default AlertsCard;
