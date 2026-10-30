import { useMemo, useState, type FormEvent } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, ArrowRight, Check, PackageSearch } from 'lucide-react';
import { getTrackPreordersQueryKey, useTrackPreorders } from '@workspace/api-client-react';
import type { TrackPreordersParams } from '@workspace/api-client-react';
import { apiErrorMessage, statusCopy } from '../lib/order-status';

type LookupMode = 'phone' | 'orderId';
const phonePattern = /^0[567][0-9]{8}$/;
const orderIdPattern = /^[\s\S]{12,40}$/;

export default function TrackPage() {
  const [mode, setMode] = useState<LookupMode>(() => new URLSearchParams(window.location.search).has('orderId') ? 'orderId' : 'phone');
  const [value, setValue] = useState(() => new URLSearchParams(window.location.search).get('orderId') ?? '');
  const [submittedParams, setSubmittedParams] = useState<TrackPreordersParams | undefined>(() => {
    const id = new URLSearchParams(window.location.search).get('orderId')?.trim();
    return id && orderIdPattern.test(id) ? { orderId: id } : undefined;
  });
  const [validationError, setValidationError] = useState('');
  const params = useMemo(() => submittedParams, [submittedParams]);
  const query = useTrackPreorders(params, {
    query: {
      enabled: !!params,
      queryKey: getTrackPreordersQueryKey(params),
      retry: false,
    },
  });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const clean = value.trim();
    const valid = mode === 'phone' ? phonePattern.test(clean) : orderIdPattern.test(clean);
    if (!valid) {
      setValidationError(mode === 'phone'
        ? 'Saisissez un numéro algérien valide de 10 chiffres.'
        : 'L’identifiant doit contenir entre 12 et 40 caractères.');
      setSubmittedParams(undefined);
      return;
    }
    setValidationError('');
    setSubmittedParams(mode === 'phone' ? { phone: clean } : { orderId: clean });
  }

  const results = query.data ?? [];
  return (
    <main className="min-h-[100dvh] bg-[#f5f0e7] text-[#301923]" data-testid="page-track">
      <header className="border-b border-[#c6a56a]/30 bg-[#281018] text-[#f5f0e7]">
        <div className="mx-auto flex h-[76px] max-w-6xl items-center justify-between px-5 md:px-10">
          <Link href="/" className="flex items-center gap-3" data-testid="link-track-home">
            <span className="grid h-10 w-10 place-items-center border border-[#c6a56a]/65 text-[#c6a56a]">✧</span>
            <span className="leading-tight"><span className="serif block text-lg tracking-[.08em]">GRANADA</span><span className="block text-[8px] tracking-[.3em] text-[#c6a56a]">PARFUMS · ALGÉRIE</span></span>
          </Link>
          <Link href="/" className="text-[10px] tracking-[.16em] text-[#e6d7c7] transition-colors hover:text-[#d7bd82]" data-testid="link-track-storefront">LA MAISON <ArrowRight className="ml-2 inline" size={13} /></Link>
        </div>
      </header>
      <section className="relative overflow-hidden border-b border-[#d8cdbd] bg-[#eee7dc]">
        <div className="tile-pattern absolute inset-0 opacity-25" />
        <div className="relative mx-auto max-w-6xl px-5 py-14 md:px-10 md:py-20">
          <Link href="/" className="mb-8 inline-flex items-center gap-2 text-[10px] tracking-[.17em] text-[#765143]" data-testid="link-track-back"><ArrowLeft size={14} /> RETOUR À LA MAISON</Link>
          <p className="section-kicker !text-[#7e5c42]">SUIVI DE VOTRE COMMANDE</p>
          <h1 className="serif mt-4 max-w-[720px] text-5xl leading-[1.05] sm:text-7xl">Chaque étape,<br /><span className="text-[#765143]">avec attention.</span></h1>
          <p className="mt-5 max-w-lg text-sm leading-7 text-[#6e6258]">Retrouvez l’avancement de votre précommande avec votre numéro ou l’identifiant reçu après confirmation.</p>
        </div>
      </section>
      <section className="mx-auto grid max-w-6xl gap-10 px-5 py-12 md:grid-cols-[.82fr_1.18fr] md:px-10 md:py-16">
        <aside className="border-l border-[#a98c5b] pl-5">
          <PackageSearch size={24} strokeWidth={1.3} className="text-[#8b6d42]" />
          <h2 className="serif mt-5 text-2xl">Un suivi discret.</h2>
          <p className="mt-3 text-sm leading-7 text-[#71655d]">Pour protéger vos informations, nous affichons uniquement le statut de la commande. Aucun nom, numéro de téléphone ou wilaya ne sera présenté.</p>
          <p dir="rtl" className="mt-5 text-base leading-7 text-[#765143]">طلبك في أيدٍ أمينة، خطوة بخطوة.</p>
        </aside>
        <div>
          <form onSubmit={submit} noValidate className="border border-[#ded3c4] bg-[#faf7f1] p-5 sm:p-8" data-testid="form-track-order">
            <div className="mb-6 border-b border-[#e4dbce] pb-4">
              <p className="section-kicker !text-[#8b7251]">RECHERCHER</p>
              <h2 className="serif mt-2 text-2xl">Comment souhaitez-vous retrouver votre commande ?</h2>
            </div>
            <div className="mb-5 grid grid-cols-2 gap-2" role="group" aria-label="Méthode de recherche">
              <button type="button" onClick={() => { setMode('phone'); setValue(''); setValidationError(''); setSubmittedParams(undefined); }} aria-pressed={mode === 'phone'} className={`min-h-11 border px-3 text-[10px] tracking-[.1em] transition-colors ${mode === 'phone' ? 'border-[#4b1827] bg-[#4b1827] text-[#f5f0e7]' : 'border-[#d7cbbb] text-[#604b35] hover:border-[#8b6d42]'}`} data-testid="button-track-phone">PAR TÉLÉPHONE</button>
              <button type="button" onClick={() => { setMode('orderId'); setValue(''); setValidationError(''); setSubmittedParams(undefined); }} aria-pressed={mode === 'orderId'} className={`min-h-11 border px-3 text-[10px] tracking-[.1em] transition-colors ${mode === 'orderId' ? 'border-[#4b1827] bg-[#4b1827] text-[#f5f0e7]' : 'border-[#d7cbbb] text-[#604b35] hover:border-[#8b6d42]'}`} data-testid="button-track-id">PAR IDENTIFIANT</button>
            </div>
            <label className="grid gap-2 text-xs font-medium text-[#493b36]" htmlFor="tracking-value">
              {mode === 'phone' ? 'Numéro de téléphone' : 'Identifiant de commande'}
              <input id="tracking-value" value={value} onChange={(event) => setValue(mode === 'phone' ? event.target.value.replace(/\s/g, '') : event.target.value)} inputMode={mode === 'phone' ? 'numeric' : 'text'} autoComplete="off" placeholder={mode === 'phone' ? '05 00 00 00 00' : 'Ex. GR-…'} className="h-12 border border-[#d7cbbb] bg-transparent px-4 text-sm outline-none focus:border-[#8c6b42] focus:ring-2 focus:ring-[#c6a56a]/20" data-testid="input-tracking-value" />
            </label>
            {validationError && <p role="alert" className="mt-3 text-xs text-[#8d2d37]" data-testid="status-track-validation">{validationError}</p>}
            {query.isError && <div role="alert" className="mt-3 border border-[#d9b8b2] bg-[#f8eeeb] px-4 py-3 text-sm text-[#813640]" data-testid="status-track-error"><p>{apiErrorMessage(query.error)}</p><button type="button" onClick={() => void query.refetch()} className="mt-3 border border-[#813640] px-3 py-2 text-[9px] font-semibold tracking-[.12em]" data-testid="button-retry-track">RÉESSAYER</button></div>}
            <button type="submit" disabled={query.isFetching} className="mt-5 flex min-h-[52px] w-full items-center justify-center gap-3 bg-[#4b1827] text-[10px] font-semibold tracking-[.16em] text-[#f4e9d6] transition-colors hover:bg-[#64253a] disabled:cursor-wait disabled:opacity-70" data-testid="button-submit-track">{query.isFetching ? 'RECHERCHE EN COURS…' : 'CONSULTER LE STATUT'} <ArrowRight size={15} /></button>
          </form>
          {query.isLoading && <div className="mt-6 animate-pulse border border-[#ded3c4] bg-[#faf7f1] p-7" data-testid="skeleton-track"><div className="h-3 w-32 bg-[#ded3c4]" /><div className="mt-5 h-7 w-2/3 bg-[#e7ded2]" /><div className="mt-5 h-3 w-full bg-[#e7ded2]" /></div>}
          {params && query.isSuccess && results.length === 0 && <div role="status" className="mt-6 border border-[#ded3c4] bg-[#faf7f1] px-6 py-7" data-testid="status-track-not-found"><p className="section-kicker !text-[#8b7251]">AUCUN RÉSULTAT</p><h3 className="serif mt-2 text-2xl">Nous n’avons pas retrouvé cette commande.</h3><p className="mt-2 text-sm leading-6 text-[#71655d]">Vérifiez les informations saisies, puis réessayez.</p></div>}
          {results.map((order) => {
            const state = statusCopy[order.status];
            return <article key={order.orderId} className="mt-6 border border-[#ded3c4] bg-[#faf7f1] p-5 sm:p-7" data-testid={`card-tracking-${order.orderId}`}>
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#e4dbce] pb-5">
                <div><p className="section-kicker !text-[#8b7251]">COMMANDE</p><p className="mt-2 font-mono text-sm text-[#4b1827]" data-testid={`text-order-id-${order.orderId}`}>{order.orderId}</p></div>
                <span className="border border-[#c6a56a]/60 px-3 py-2 text-[10px] tracking-[.1em] text-[#604b35]" data-testid={`status-order-${order.orderId}`}>{state.label.toUpperCase()}</span>
              </div>
              <div className="mt-6 grid grid-cols-3">
                {(['pending', 'out_for_delivery', 'delivered'] as const).map((step, index) => {
                  const active = index <= state.step;
                  return <div key={step} className="relative text-center" data-testid={`step-order-${order.orderId}-${step}`}>
                    {index > 0 && <span className={`absolute left-0 right-1/2 top-3 h-px ${index <= state.step ? 'bg-[#8b6d42]' : 'bg-[#d7cbbb]'}`} />}
                    {index < 2 && <span className={`absolute left-1/2 right-0 top-3 h-px ${index < state.step ? 'bg-[#8b6d42]' : 'bg-[#d7cbbb]'}`} />}
                    <span className={`relative mx-auto grid h-6 w-6 place-items-center rounded-full border ${active ? 'border-[#8b6d42] bg-[#8b6d42] text-[#fffaf1]' : 'border-[#c9bba7] bg-[#f5f0e7] text-transparent'}`}>{active && <Check size={13} />}</span>
                    <span className={`mt-2 block text-[9px] leading-4 sm:text-[10px] ${active ? 'text-[#4b1827]' : 'text-[#988d81]'}`}>{statusCopy[step].label}</span>
                  </div>;
                })}
              </div>
              <p className="mt-5 text-sm text-[#71655d]" data-testid={`text-order-detail-${order.orderId}`}>{state.detail}</p>
              <p className="mt-2 text-[10px] text-[#8c8176]">Dernière mise à jour · {new Date(order.updatedAt).toLocaleString('fr-DZ')}</p>
            </article>;
          })}
        </div>
      </section>
      <footer className="bg-[#211219] px-5 py-7 text-center text-[9px] tracking-[.16em] text-[#ddc795]">GRANADA PARFUMS · L’ART DU PARFUM, DEPUIS L’ALGÉRIE</footer>
    </main>
  );
}
