import geoip from 'geoip-lite';

/**
 * Získá country kód (např. 'CZ', 'US') z IP adresy nebo Accept-Language headeru.
 * @param {Request} req - Express request objekt
 * @returns {string|null} - Dvoupísmenný country code nebo null
 */

export const getCountry = (req) => {
  try {
    // Zjistit IP adresu
    const ip =
      req.headers['x-forwarded-for']?.split(',')[0] ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      req.ip;

    const geo = geoip.lookup(ip);

    if (geo && geo.country) {
      return geo.country;
    }

    // Fallback: Accept-Language → např. cs-CZ, en-US, de
    const acceptLanguage = req.headers['accept-language'];
    if (acceptLanguage) {
      const match = acceptLanguage.match(/-[a-z]{2}/i);
      if (match) {
        return match[0].substring(1).toUpperCase();
      }
    }

    // Pokud nic nezískám
    return 'WW';
  } catch (err) {
    console.error('Chyba při určování country kódu:', err);
    return 'WW';
  }
};
