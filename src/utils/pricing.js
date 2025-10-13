const toCents = (n) => Math.round(Number(n || 0) * 100);
const fromCents = (c) => (c / 100).toFixed(2);

function computePriceCentsFixed(product, selections = {}, opts = {}) {
  const {
    giftWrapCents = 200,
    smallNoteCents = 100,
    precedence = 'lot',
  } = opts;

  if (!product) throw new Error('Produit manquant');

  const hasLot = selections.lotQuantities != null;
  const hasDim = selections.dimensionId != null;

  if (hasLot && hasDim && precedence === 'error') {
    throw new Error('Lot et dimension ne peuvent pas être sélectionnés en même temps');
  }

  let totalCents = toCents(product.price);

  if (hasLot && precedence === 'lot') {
    const lot = (product.lot || []).find(
      l => Number(l.quantities) === Number(selections.lotQuantities)
    );
    if (!lot) throw new Error('Lot invalide pour ce produit');
    totalCents = toCents(lot.price);
  }

  if ((!hasLot || precedence !== 'lot') && hasDim) {
    const dim = (product.dimensions || []).find(
      d => String(d._id ?? d.id) === String(selections.dimensionId)
    );
    if (!dim) throw new Error('Dimension invalide pour ce produit');
    totalCents = toCents(dim.price);
  }

  if (selections.gift) totalCents += giftWrapCents;
  if (selections.message && String(selections.message).trim().length > 0) {
    totalCents += smallNoteCents;
  }

  return totalCents;
}

module.exports = { computePriceCentsFixed, toCents, fromCents };