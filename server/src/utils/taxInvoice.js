export const VAT_RATE = 0.14;

const roundCurrency = (value) => Math.round(Number(value || 0) * 100) / 100;

export const calculateTaxInvoice = ({ baseAccommodation = 0, housekeeping = 0, beachFees = 0, promoDiscountPercentage = 0 }) => {
  const subtotal = roundCurrency(Number(baseAccommodation || 0) + Number(housekeeping || 0) + Number(beachFees || 0));
  const promoDiscountAmount = roundCurrency(subtotal * (Math.max(0, Number(promoDiscountPercentage || 0)) / 100));
  const taxableSubtotal = roundCurrency(Math.max(0, subtotal - promoDiscountAmount));
  const taxAmount = roundCurrency(taxableSubtotal * VAT_RATE);
  const finalPrice = roundCurrency(taxableSubtotal + taxAmount);

  return {
    subtotal,
    promoDiscountAmount,
    taxableSubtotal,
    taxRate: VAT_RATE,
    taxAmount,
    finalPrice
  };
};