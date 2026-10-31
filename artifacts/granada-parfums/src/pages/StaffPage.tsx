import { useMemo, useState } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, RefreshCw, ShieldAlert } from 'lucide-react';
import { getListStaffPreordersQueryKey, useListStaffPreorders, useUpdatePreorderStatus } from '@workspace/api-client-react';
import type { PreorderStatus, PreorderStatusUpdate } from '@workspace/api-client-react';
import { formatDzd } from '../components/BundlePricing';
import { useQueryClient } from '@tanstack/react-query';
import { apiErrorMessage, apiErrorStatus, statusCopy } from '../lib/order-status';

const statuses: PreorderStatus[] = ['pending', 'out_for_delivery', 'delivered'];

export default function StaffPage() {
  const queryClient = useQueryClient();
  const ordersQuery = useListStaffPreorders({
    query: { queryKey: getListStaffPreordersQueryKey(), retry: false },
    request: { credentials: 'include' },
  });
  const updateStatus = useUpdatePreorderStatus({ request: { credentials: 'include' } });
  const [drafts, setDrafts] = useState<Record<string, PreorderStatus>>({});
  const [updatedId, setUpdatedId] = useState('');
  const orders = useMemo(() => ordersQuery.data ?? [], [ordersQuery.data]);
  const unauthorized = apiErrorStatus(ordersQuery.error) === 401 || apiErrorStatus(ordersQuery.error) === 403;

  async function save(orderId: string, status: PreorderStatus) {
    const data: PreorderStatusUpdate = { status };
    setUpdatedId('');
    try {
      await updateStatus.mutateAsync({ orderId, data });
      setDrafts((current) => { const next = { ...current }; delete next[orderId]; return next; });
      setUpdatedId(orderId);
      await queryClient.invalidateQueries({ queryKey: getListStaffPreordersQueryKey() });
    } catch {
      // Mutation error is rendered in the row below.
    }
  }

  return <main className="min-h-[100dvh] bg-[#f5f0e7] text-[#301923]" data-testid="page-staff">
    <header className="bg-[#281018] text-[#f5f0e7]">
      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 md:px-10">
        <Link href="/" className="flex items-center gap-3" data-testid="link-staff-home"><span className="grid h-10 w-10 place-items-center border border-[#c6a56a]/65 text-[#c6a56a]">✧</span><span className="leading-tight"><span className="serif block text-lg tracking-[.08em]">GRANADA</span><span className="block text-[8px] tracking-[.3em] text-[#c6a56a]">PARFUMS · ALGÉRIE</span></span></Link>
        <span className="text-[9px] tracking-[.2em] text-[#ddc795]">ESPACE ÉQUIPE</span>
      </div>
    </header>
    <section className="border-b border-[#d8cdbd] bg-[#eee7dc]">
      <div className="mx-auto max-w-7xl px-5 py-12 md:px-10 md:py-16">
        <Link href="/" className="inline-flex items-center gap-2 text-[10px] tracking-[.16em] text-[#765143]" data-testid="link-staff-back"><ArrowLeft size={14} /> RETOUR À LA MAISON</Link>
        <div className="mt-7 flex flex-wrap items-end justify-between gap-5">
          <div><p className="section-kicker !text-[#7e5c42]">GRANADA · GESTION DES PRÉCOMMANDES</p><h1 className="serif mt-3 text-4xl sm:text-6xl">Le carnet des commandes.</h1></div>
          <button type="button" onClick={() => void ordersQuery.refetch()} disabled={ordersQuery.isFetching} className="inline-flex min-h-11 items-center gap-2 border border-[#8b6d42] px-4 text-[10px] tracking-[.13em] text-[#604b35] transition-colors hover:bg-[#e5dac9] disabled:opacity-50" data-testid="button-refresh-staff"><RefreshCw size={14} className={ordersQuery.isFetching ? 'animate-spin' : ''} /> ACTUALISER</button>
        </div>
      </div>
    </section>
    <section className="mx-auto max-w-7xl px-5 py-8 md:px-10 md:py-12">
      {ordersQuery.isLoading && <div className="space-y-3" data-testid="skeleton-staff">{[0, 1, 2].map((item) => <div key={item} className="h-24 animate-pulse border border-[#ded3c4] bg-[#faf7f1]" />)}</div>}
      {unauthorized && <div className="mx-auto max-w-2xl border border-[#d9b8b2] bg-[#f8eeeb] p-7 sm:p-10" role="alert" data-testid="status-staff-unauthorized"><ShieldAlert size={25} className="text-[#813640]" /><p className="section-kicker mt-5 !text-[#813640]">ACCÈS RESTREINT</p><h2 className="serif mt-2 text-3xl">Réservé à l’équipe Granada.</h2><p className="mt-3 text-sm leading-7 text-[#765d58]">Cette session n’est pas autorisée à consulter les commandes. Connectez-vous avec le compte de l’équipe Granada. L’accès est vérifié par le serveur.</p><Link href="/sign-in" className="mt-6 inline-flex min-h-11 items-center border border-[#4b1827] px-5 text-[10px] tracking-[.14em] text-[#4b1827] hover:bg-[#4b1827] hover:text-[#f5f0e7]" data-testid="link-staff-sign-in">CONNEXION ÉQUIPE</Link></div>}
      {ordersQuery.isError && !unauthorized && <div role="alert" className="border border-[#d9b8b2] bg-[#f8eeeb] p-6 text-sm text-[#813640]" data-testid="status-staff-error"><p>{apiErrorMessage(ordersQuery.error)}</p><button type="button" onClick={() => void ordersQuery.refetch()} className="mt-4 border border-[#813640] px-4 py-2 text-[10px] tracking-[.12em]" data-testid="button-retry-staff">RÉESSAYER</button></div>}
      {ordersQuery.isSuccess && orders.length === 0 && <div className="border border-[#ded3c4] bg-[#faf7f1] px-6 py-12 text-center" data-testid="status-staff-empty"><p className="section-kicker !text-[#8b7251]">CARNET VIERGE</p><h2 className="serif mt-3 text-3xl">Aucune précommande pour le moment.</h2><p className="mt-2 text-sm text-[#71655d]">Les nouvelles commandes apparaîtront ici.</p></div>}
      {orders.length > 0 && <div className="overflow-hidden border border-[#ded3c4] bg-[#faf7f1]" data-testid="list-staff-orders">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#ded3c4] px-5 py-4"><p className="section-kicker !text-[#8b7251]">COMMANDES REÇUES</p><span className="font-mono text-xs text-[#765143]" data-testid="text-staff-count">{orders.length.toString().padStart(2, '0')} ENREGISTRÉE{orders.length > 1 ? 'S' : ''}</span></div>
        <div className="divide-y divide-[#e4dbce]">
          {orders.map((order) => {
            const selected = drafts[order.orderId] ?? order.status;
            const isSaving = updateStatus.isPending && updateStatus.variables?.orderId === order.orderId;
            const orderItems: string[] = [];
            if (order.royaleQuantity > 0) {
              orderItems.push(`${order.royaleQuantity} × 50 ml Édition Royale`);
            }
            if (order.blancheQuantity > 0) {
              orderItems.push(`${order.blancheQuantity} × 30 ml Édition Blanche`);
            }
            return <article key={order.orderId} className="grid gap-5 px-5 py-6 lg:grid-cols-[1fr_1fr_auto] lg:items-center lg:px-7" data-testid={`row-staff-order-${order.orderId}`}>
              <div>
                <p className="font-mono text-xs text-[#4b1827]" data-testid={`text-staff-order-id-${order.orderId}`}>{order.orderId}</p>
                <p className="serif mt-2 text-xl" data-testid={`text-staff-order-name-${order.orderId}`}>{order.name}</p>
                <p className="mt-1 text-xs text-[#71655d]">{order.phone} · Wilaya {order.wilaya}</p>
                <p className="mt-2 text-[10px] text-[#8c8176]">{orderItems.join(' · ')}</p>
                <p className="mt-1 text-[10px] text-[#8c8176]">Sous-total · {formatDzd(order.subtotalDzd)} DZD</p>
                {order.discountDzd > 0 && <p className="mt-1 text-[10px] text-[#765143]">Remise duo · −{formatDzd(order.discountDzd)} DZD</p>}
                <p className="mt-1 text-xs font-semibold text-[#4b1827]">Total · {formatDzd(order.totalDzd)} DZD</p>
              </div>
              <div className="text-xs text-[#71655d]"><p>Reçue le {new Date(order.createdAt).toLocaleString('fr-DZ')}</p><p className="mt-2">Statut actuel · <span className="text-[#4b1827]">{statusCopy[order.status].label}</span></p></div>
              <div className="flex flex-wrap items-center gap-2">
                <select aria-label={`Statut ${order.orderId}`} value={selected} onChange={(event) => setDrafts((current) => ({ ...current, [order.orderId]: event.target.value as PreorderStatus }))} className="h-11 min-w-40 border border-[#d7cbbb] bg-[#faf7f1] px-3 text-xs text-[#301923] outline-none focus:border-[#8c6b42]" data-testid={`select-staff-status-${order.orderId}`}>
                  {statuses.map((status) => <option key={status} value={status}>{statusCopy[status].label}</option>)}
                </select>
                <button type="button" onClick={() => void save(order.orderId, selected)} disabled={isSaving || selected === order.status} className="min-h-11 bg-[#4b1827] px-4 text-[9px] font-semibold tracking-[.13em] text-[#f5f0e7] transition-colors hover:bg-[#64253a] disabled:cursor-not-allowed disabled:opacity-45" data-testid={`button-save-status-${order.orderId}`}>{isSaving ? 'ENREGISTREMENT…' : 'ENREGISTRER'}</button>
              </div>
              {updatedId === order.orderId && <p role="status" className="text-xs text-[#49613e] lg:col-span-3" data-testid={`status-staff-updated-${order.orderId}`}>Statut mis à jour.</p>}
              {updateStatus.isError && updateStatus.variables?.orderId === order.orderId && <p role="alert" className="text-xs text-[#813640] lg:col-span-3" data-testid={`status-staff-update-error-${order.orderId}`}>{apiErrorMessage(updateStatus.error)}</p>}
            </article>;
          })}
        </div>
      </div>}
    </section>
    <footer className="bg-[#211219] px-5 py-7 text-center text-[9px] tracking-[.16em] text-[#ddc795]">GRANADA PARFUMS · ESPACE ÉQUIPE</footer>
  </main>;
}
