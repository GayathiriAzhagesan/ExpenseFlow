/**
 * UPI Utility functions for ExpenseFlow
 * Handles parsing, validating, and generating standard UPI deep links.
 */

/**
 * Parses and validates raw QR code string content for UPI payment specifications.
 * Format: upi://pay?pa=example@upi&pn=Example&am=500&cu=INR
 *
 * @param {string} rawData
 * @returns {{
 *   isValid: boolean,
 *   data?: {
 *     pa: string,
 *     pn: string,
 *     am: number | null,
 *     cu: string,
 *     tn: string,
 *     raw: string
 *   },
 *   error?: string
 * }}
 */
export function parseAndValidateUpiQr(rawData) {
  if (!rawData || typeof rawData !== 'string') {
    return {
      isValid: false,
      error: 'Please scan a valid UPI payment QR code.',
    };
  }

  const trimmed = rawData.trim();

  // Must match UPI URI scheme (case-insensitive)
  if (!/^upi:\/\/pay/i.test(trimmed)) {
    return {
      isValid: false,
      error: 'Please scan a valid UPI payment QR code.',
    };
  }

  try {
    // Extract query string part
    const queryIndex = trimmed.indexOf('?');
    if (queryIndex === -1) {
      return {
        isValid: false,
        error: 'Missing UPI payment parameters in QR code.',
      };
    }

    const queryString = trimmed.slice(queryIndex + 1);
    const params = new URLSearchParams(queryString);

    // Case-insensitive lookup helper
    const getParam = (key) => {
      for (const [k, v] of params.entries()) {
        if (k.toLowerCase() === key.toLowerCase()) {
          return v;
        }
      }
      return null;
    };

    const pa = getParam('pa'); // Payee VPA / UPI ID
    if (!pa || !pa.includes('@')) {
      return {
        isValid: false,
        error: 'Invalid UPI ID (VPA) in scanned QR code.',
      };
    }

    const pn = getParam('pn') ? decodeURIComponent(getParam('pn')) : pa.split('@')[0];
    const rawAm = getParam('am');
    const am = rawAm && !isNaN(Number(rawAm)) && Number(rawAm) > 0 ? Number(rawAm) : null;
    const cu = (getParam('cu') || 'INR').toUpperCase();
    const tn = getParam('tn') ? decodeURIComponent(getParam('tn')) : 'ExpenseFlow Settlement';

    return {
      isValid: true,
      data: {
        pa: pa.trim(),
        pn: pn.trim(),
        am,
        cu,
        tn,
        raw: trimmed,
      },
    };
  } catch (err) {
    return {
      isValid: false,
      error: 'Failed to parse UPI QR code data.',
    };
  }
}

/**
 * Generates a valid standard UPI deep link URL
 */
export function generateUpiDeepLink({ pa, pn, am, cu = 'INR', tn = 'ExpenseFlow Settlement' }) {
  if (!pa) return '';

  const params = new URLSearchParams();
  params.set('pa', pa);
  if (pn) params.set('pn', pn);
  if (am !== undefined && am !== null && Number(am) > 0) {
    params.set('am', Number(am).toFixed(2));
  }
  params.set('cu', cu || 'INR');
  if (tn) params.set('tn', tn);

  return `upi://pay?${params.toString()}`;
}
