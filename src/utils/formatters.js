export const formatIndianAmount = (value, decimals) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "0";

  const options = decimals === undefined
    ? { maximumFractionDigits: 2 }
    : { minimumFractionDigits: decimals, maximumFractionDigits: decimals };

  return new Intl.NumberFormat("en-IN", options).format(amount);
};
