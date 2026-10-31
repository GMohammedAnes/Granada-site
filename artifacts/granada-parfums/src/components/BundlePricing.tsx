export type OrderQuantities = {
  royaleQuantity: number;
  blancheQuantity: number;
};

export type OrderTotals = {
  itemCount: number;
  subtotalDzd: number;
  discountDzd: number;
  totalDzd: number;
  hasBundle: boolean;
};

export const getOrderTotals = ({
  royaleQuantity,
  blancheQuantity,
}: OrderQuantities): OrderTotals => {
  const subtotalDzd = royaleQuantity * 2_000 + blancheQuantity * 1_200;
  const hasBundle = royaleQuantity > 0 && blancheQuantity > 0;
  const discountDzd = hasBundle ? Math.round(subtotalDzd * 0.1) : 0;

  return {
    itemCount: royaleQuantity + blancheQuantity,
    subtotalDzd,
    discountDzd,
    totalDzd: subtotalDzd - discountDzd,
    hasBundle,
  };
};

export const formatDzd = (value: number) =>
  new Intl.NumberFormat("fr-DZ", { maximumFractionDigits: 0 }).format(value);

type BundlePricingProps = {
  quantities: OrderQuantities;
  maxTotal: number;
  onQuantityChange: (key: keyof OrderQuantities, value: number) => void;
};

export default function BundlePricing({
  quantities,
  maxTotal,
  onQuantityChange,
}: BundlePricingProps) {
  const totals = getOrderTotals(quantities);
  const products = [
    {
      key: "royaleQuantity" as const,
      title: "50 ml · Édition Royale",
      arabic: "النسخة الملكية",
      price: 2_000,
      testId: "royal",
    },
    {
      key: "blancheQuantity" as const,
      title: "30 ml · Édition Blanche",
      arabic: "النسخة البيضاء",
      price: 1_200,
      testId: "ivory",
    },
  ];

  return (
    <fieldset className="grid gap-3" data-testid="bundle-pricing">
      <legend className="mb-1 text-[12px] font-medium text-[#493b36]">
        اختار عطرك <span className="text-[#998b7e]">· Choisissez vos formats</span>
      </legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {products.map((product) => {
          const quantity = quantities[product.key];
          const otherQuantity =
            product.key === "royaleQuantity"
              ? quantities.blancheQuantity
              : quantities.royaleQuantity;
          const maxQuantity = Math.max(0, maxTotal - otherQuantity);
          const selected = quantity > 0;

          return (
            <div
              key={product.key}
              className={`border p-3 transition-colors ${
                selected
                  ? "border-[#8b6d42] bg-[#f0e9dd]"
                  : "border-[#d7cbbb] bg-transparent"
              }`}
              data-testid={`option-variant-${product.testId}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[11px] font-semibold text-[#35211f]">
                    {product.title}
                  </p>
                  <p dir="rtl" className="mt-1 text-[10px] text-[#8a7665]">
                    {product.arabic}
                  </p>
                  <p className="mt-2 text-[11px] text-[#84633d]">
                    {formatDzd(product.price)} DZD
                  </p>
                </div>
                {selected && (
                  <span className="border border-[#c6a56a]/70 px-2 py-1 text-[8px] tracking-[.12em] text-[#765143]">
                    SÉLECTIONNÉ
                  </span>
                )}
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-[#d7cbbb] pt-3">
                <span className="text-[10px] text-[#71655d]">Quantité</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label={`Retirer une bouteille ${product.title}`}
                    onClick={() => onQuantityChange(product.key, quantity - 1)}
                    disabled={quantity === 0}
                    className="grid h-9 w-9 place-items-center border border-[#bba98f] text-lg leading-none text-[#4b1827] transition-colors hover:bg-[#4b1827] hover:text-[#f5f0e7] disabled:cursor-not-allowed disabled:opacity-40"
                    data-testid={`button-decrease-${product.testId}`}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={maxQuantity}
                    step={1}
                    value={quantity}
                    onChange={(event) =>
                      onQuantityChange(product.key, Number(event.target.value))
                    }
                    aria-label={`Quantité ${product.title}`}
                    className="h-9 w-14 border border-[#d7cbbb] bg-[#faf7f1] text-center text-sm text-[#301923] outline-none focus:border-[#8c6b42]"
                    data-testid={`input-quantity-${product.testId}`}
                  />
                  <button
                    type="button"
                    aria-label={`Ajouter une bouteille ${product.title}`}
                    onClick={() => onQuantityChange(product.key, quantity + 1)}
                    disabled={quantity >= maxQuantity}
                    className="grid h-9 w-9 place-items-center border border-[#8b6d42] text-lg leading-none text-[#4b1827] transition-colors hover:bg-[#4b1827] hover:text-[#f5f0e7] disabled:cursor-not-allowed disabled:opacity-40"
                    data-testid={`button-increase-${product.testId}`}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {totals.hasBundle ? (
        <div
          role="status"
          className="flex flex-wrap items-center justify-between gap-2 border border-[#c6a56a]/70 bg-[#f3ecdc] px-4 py-3 text-[10px] text-[#604b35]"
          data-testid="badge-bundle-savings"
        >
          <span className="font-semibold tracking-[.1em]">
            DUO GRANADA · −10% · خصم 10%
          </span>
          <span className="font-medium text-[#4b1827]">
            Économisez {formatDzd(totals.discountDzd)} DZD · وفر{" "}
            {formatDzd(totals.discountDzd)} دج
          </span>
        </div>
      ) : (
        <p className="border border-dashed border-[#c6a56a]/70 px-4 py-3 text-[10px] leading-5 text-[#806344]">
          Choisissez les deux formats pour bénéficier de 10% de remise · اختر
          الحجمين للاستفادة من خصم 10٪
        </p>
      )}
      <dl
        aria-live="polite"
        className="grid gap-2 border-t border-[#e4dbce] pt-4 text-xs text-[#71655d]"
        data-testid="summary-order-total"
      >
        <div className="flex justify-between gap-4">
          <dt>Sous-total · المجموع</dt>
          <dd data-testid="text-order-subtotal">{formatDzd(totals.subtotalDzd)} DZD</dd>
        </div>
        {totals.hasBundle && (
          <div className="flex justify-between gap-4 text-[#765143]">
            <dt>Remise duo · خصم المجموعة</dt>
            <dd data-testid="text-order-discount">−{formatDzd(totals.discountDzd)} DZD</dd>
          </div>
        )}
        <div className="flex items-baseline justify-between gap-4 border-t border-[#e4dbce] pt-3 text-[#4b1827]">
          <dt className="font-semibold">Total à régler · الإجمالي</dt>
          <dd className="serif text-xl font-semibold" data-testid="text-order-total">
            {formatDzd(totals.totalDzd)} DZD
          </dd>
        </div>
        <p className="text-[10px] text-[#897c70]">
          {totals.itemCount} bouteille{totals.itemCount === 1 ? "" : "s"} ·{" "}
          {maxTotal} unité{maxTotal === 1 ? "" : "s"} restante{maxTotal === 1 ? "" : "s"} dans la première série
        </p>
      </dl>
    </fieldset>
  );
}
