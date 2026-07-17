import * as React from "react";
import { UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";

type DayListPatientFormProps = {
  codeQuery: string;
  error: string;
  onCodeChange: (value: string) => void;
  onSubmit: () => void;
};

export function DayListPatientForm({
  codeQuery,
  error,
  onCodeChange,
  onSubmit,
}: DayListPatientFormProps) {
  const inputRefs = React.useRef<Array<HTMLInputElement | null>>([]);
  const digits = React.useMemo(() => {
    const codeDigits = codeQuery.replace(/[^\d]/g, "").slice(0, 11).split("");
    return Array.from({ length: 11 }, (_, index) => codeDigits[index] ?? "");
  }, [codeQuery]);

  const updateDigits = (nextDigits: string[]) => onCodeChange(nextDigits.join(""));

  return (
    <section
      className="rounded-lg border border-[hsl(214,22%,88%)] bg-[hsl(214,38%,98%)] p-5 sm:p-6"
      aria-labelledby="add-patient-title"
    >
      <h2
        id="add-patient-title"
        className="text-sm font-semibold text-[hsl(222,28%,20%)]"
      >
        Pievienot pacientu sarakstam
      </h2>

      <form
        className="mt-3 flex flex-col gap-4 xl:flex-row xl:items-center"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >

        <fieldset className="min-w-0 flex-1">
          <legend className="sr-only">Personas kods</legend>
          <div className="overflow-x-auto pb-1">
            <div className="flex min-w-max items-center gap-1.5 sm:gap-2">
              {digits.map((digit, index) => (
                <React.Fragment key={index}>
                  <input
                    ref={(node) => {
                      inputRefs.current[index] = node;
                    }}
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    maxLength={1}
                    value={digit}
                    onChange={(event) => {
                      const nextValue = event.target.value.replace(/[^\d]/g, "").slice(-1);
                      const nextDigits = [...digits];
                      nextDigits[index] = nextValue;
                      updateDigits(nextDigits);

                      if (nextValue && index < digits.length - 1) {
                        inputRefs.current[index + 1]?.focus();
                        inputRefs.current[index + 1]?.select();
                      }
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Backspace") {
                        event.preventDefault();
                        const nextDigits = [...digits];
                        if (nextDigits[index]) {
                          nextDigits[index] = "";
                          updateDigits(nextDigits);
                        } else if (index > 0) {
                          nextDigits[index - 1] = "";
                          updateDigits(nextDigits);
                          inputRefs.current[index - 1]?.focus();
                        }
                        return;
                      }

                      if (event.key === "ArrowLeft" && index > 0) {
                        event.preventDefault();
                        inputRefs.current[index - 1]?.focus();
                      }
                      if (event.key === "ArrowRight" && index < digits.length - 1) {
                        event.preventDefault();
                        inputRefs.current[index + 1]?.focus();
                      }
                    }}
                    onPaste={(event) => {
                      event.preventDefault();
                      const pastedDigits = event.clipboardData
                        .getData("text")
                        .replace(/[^\d]/g, "")
                        .slice(0, digits.length - index)
                        .split("");
                      if (pastedDigits.length === 0) return;

                      const nextDigits = [...digits];
                      pastedDigits.forEach((value, offset) => {
                        nextDigits[index + offset] = value;
                      });
                      updateDigits(nextDigits);
                      inputRefs.current[Math.min(index + pastedDigits.length, digits.length - 1)]?.focus();
                    }}
                    className="h-11 w-10 shrink-0 rounded-md border border-[hsl(214,22%,84%)] bg-white text-center text-lg font-semibold tabular-nums text-[hsl(220,38%,24%)] outline-none transition-colors duration-200 focus:border-[hsl(216,46%,58%)] focus:ring-2 focus:ring-[rgba(59,130,246,0.12)] sm:h-12 sm:w-12"
                    aria-label={`Personas koda cipars ${index + 1}`}
                    aria-describedby={error ? "patient-personal-code-help" : undefined}
                    aria-invalid={Boolean(error)}
                  />
                  {index === 5 && (
                    <span className="px-1 text-lg font-semibold text-[hsl(218,14%,50%)]" aria-hidden="true">
                      –
                    </span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
          {error && (
            <p
              id="patient-personal-code-help"
              role="alert"
              className="mt-2 text-xs leading-4 text-[hsl(0,60%,48%)]"
            >
              {error}
            </p>
          )}
        </fieldset>

        <Button
          type="submit"
          className="h-11 w-full shrink-0 rounded-md bg-[hsl(220,36%,18%)] px-4 text-sm font-semibold text-white hover:bg-[hsl(220,36%,22%)] sm:w-auto sm:min-w-[184px]"
        >
          <UserPlus className="mr-2 h-4 w-4" strokeWidth={2} />
          Pievienot pacientu
        </Button>
      </form>
    </section>
  );
}
