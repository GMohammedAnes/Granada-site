import { useEffect, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import type { CampaignStatus } from "@workspace/api-client-react";

type CampaignScarcityProps = {
  campaign?: CampaignStatus;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
};

export function CampaignBanner({
  campaign,
  isLoading,
  isError,
}: Omit<CampaignScarcityProps, "onRetry">) {
  const message = isError
    ? "تعذر تحديث توفر الدفعة الأولى"
    : isLoading || !campaign
      ? "جارٍ تحديث توفر الدفعة الأولى"
      : campaign.remaining === 0
        ? "اكتملت الدفعة الأولى من L'Essence d'Andalousie"
        : `عرض إطلاق محدد: المتبقي ${campaign.remaining} نسخة فقط من L'Essence d'Andalousie`;

  return (
    <div
      className="sticky top-0 z-50 flex min-h-11 items-center justify-center border-b border-[#c6a56a]/55 bg-[#321621] px-3 py-2 text-center text-[10px] tracking-[.04em] text-[#f4e8d4] sm:h-10 sm:min-h-0 sm:text-xs"
      dir="rtl"
      role="status"
      aria-live="polite"
      data-testid="banner-campaign-scarcity"
    >
      <span className="mr-2 text-[#d7bd82]" aria-hidden="true">✧</span>
      <span>{message}</span>
      <span className="ml-2 text-[#d7bd82]" aria-hidden="true">✧</span>
    </div>
  );
}

export function CampaignUrgencyPanel({
  campaign,
  isLoading,
  isError,
  onRetry,
}: CampaignScarcityProps) {
  const [now, setNow] = useState(() => Date.now());
  const serverOffset = useMemo(
    () => (campaign ? Date.parse(campaign.serverTime) - Date.now() : 0),
    [campaign?.serverTime],
  );

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  const remainingMilliseconds = campaign
    ? Math.max(0, Date.parse(campaign.endsAt) - (now + serverOffset))
    : 0;
  const remainingSeconds = Math.floor(remainingMilliseconds / 1000);
  const hours = Math.floor(remainingSeconds / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds % 60;
  const expired = Boolean(campaign && remainingMilliseconds === 0);

  return (
    <aside
      className="mt-9 border border-[#c6a56a]/55 bg-[#faf7f1] p-5 shadow-[0_12px_36px_rgba(49,25,35,.06)] sm:p-6"
      aria-labelledby="campaign-panel-title"
      data-testid="panel-campaign-urgency"
    >
      <div className="flex items-start justify-between gap-4 border-b border-[#e4dbce] pb-4">
        <div>
          <p className="section-kicker !text-[#8b7251]">ÉDITION DE LANCEMENT</p>
          <h3 id="campaign-panel-title" className="serif mt-2 text-xl text-[#301923]">
            La première édition
          </h3>
        </div>
        <span className="grid h-10 w-10 shrink-0 place-items-center border border-[#c6a56a]/65 text-lg text-[#8b7251]" aria-hidden="true">
          ✧
        </span>
      </div>

      {isError ? (
        <div className="py-5" role="status" data-testid="status-campaign-error">
          <p className="text-sm leading-6 text-[#71655d]" dir="rtl">
            تعذر تحديث حالة الدفعة. حاول تحديثها مرة أخرى.
          </p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-3 inline-flex min-h-10 items-center gap-2 border border-[#765143] px-4 text-[10px] tracking-[.1em] text-[#4b1827] transition-colors hover:bg-[#f0e9dd]"
            data-testid="button-campaign-retry"
          >
            <RefreshCw size={13} />
            ACTUALISER
          </button>
        </div>
      ) : isLoading || !campaign ? (
        <div className="grid grid-cols-3 gap-2 py-5" aria-label="Chargement du compte à rebours" data-testid="status-campaign-loading">
          {[0, 1, 2].map((item) => (
            <div key={item} className="h-[72px] animate-pulse border border-[#e4dbce] bg-[#f3ede3]" />
          ))}
        </div>
      ) : (
        <>
          <div className="mt-5 flex items-center justify-between gap-3">
            <p className="text-[10px] tracking-[.11em] text-[#8b7251]">
              {expired ? "FENÊTRE DE LANCEMENT" : "FIN DE L’OFFRE DANS"}
            </p>
            <span
              className={`text-[10px] tracking-[.1em] ${campaign.remaining === 0 ? "text-[#813640]" : "text-[#765143]"}`}
              dir="rtl"
              data-testid="text-campaign-remaining"
            >
              {campaign.remaining === 0
                ? "اكتملت الدفعة الأولى"
                : `المتبقي ${campaign.remaining} نسخة`}
            </span>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2" aria-label="الوقت المتبقي في عرض الإطلاق">
            {[
              { label: "ساعة", value: hours },
              { label: "دقيقة", value: minutes },
              { label: "ثانية", value: seconds },
            ].map((part) => (
              <div
                key={part.label}
                className="border border-[#ded3c4] bg-[#f5f0e7] px-2 py-3 text-center"
                data-testid={`timer-campaign-${part.label}`}
              >
                <span className="serif block text-2xl tabular-nums text-[#4b1827]">
                  {String(part.value).padStart(2, "0")}
                </span>
                <span className="mt-1 block text-[10px] text-[#786b60]" dir="rtl">
                  {part.label}
                </span>
              </div>
            ))}
          </div>

          {expired && (
            <p className="mt-3 text-xs leading-5 text-[#71655d]" dir="rtl" data-testid="text-campaign-expired">
              انتهت مهلة الإطلاق. يستمر الحجز حتى اكتمال الدفعة الأولى.
            </p>
          )}

          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="text-[10px] tracking-[.12em] text-[#8b7251]">
                PREMIÈRE SÉRIE · {campaign.reserved}/{campaign.totalUnits}
              </p>
              <p className="text-sm font-medium text-[#4b1827]" dir="rtl" data-testid="text-campaign-progress">
                تم حجز {campaign.progressPercent}% من الدفعة الأولى
              </p>
            </div>
            <div
              className="h-2 overflow-hidden bg-[#e7ded1]"
              role="progressbar"
              aria-label="نسبة حجز الدفعة الأولى"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={campaign.progressPercent}
              data-testid="progress-campaign-reserved"
            >
              <div
                className="h-full bg-gradient-to-r from-[#765143] via-[#b2915a] to-[#d3b779] transition-[width] duration-700 ease-out"
                style={{ width: `${campaign.progressPercent}%` }}
              />
            </div>
          </div>
        </>
      )}
    </aside>
  );
}
