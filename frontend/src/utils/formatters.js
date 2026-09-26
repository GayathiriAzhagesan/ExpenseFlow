/**
 * Formats a number to Indian Rupee representation (e.g. ₹5,400 or ₹12,800.50)
 */
export const formatINR = (amount, decimals = 0) => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '₹0';
  }
  const numeric = Number(amount);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(numeric);
};

/**
 * Formats date into readable string e.g. "24 Sep 2026"
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d);
};

/**
 * Returns category color token and icon identifier
 */
export const getCategoryMeta = (category) => {
  switch (category?.toLowerCase()) {
    case 'food & dining':
    case 'food':
      return { icon: 'pizza', bg: 'bg-amber-500/10 text-amber-500 border-amber-500/20' };
    case 'entertainment':
    case 'movie':
      return { icon: 'film', bg: 'bg-purple-500/10 text-purple-400 border-purple-500/20' };
    case 'transportation':
    case 'travel':
      return { icon: 'car', bg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' };
    case 'groceries':
      return { icon: 'shopping-bag', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
    case 'bills & utilities':
    case 'rent':
      return { icon: 'zap', bg: 'bg-rose-500/10 text-rose-400 border-rose-500/20' };
    default:
      return { icon: 'receipt', bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' };
  }
};
