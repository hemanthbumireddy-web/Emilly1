const { createHash } = require('node:crypto');

const CACHE_TTL_MS = 10 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 10 * 1000;
const MAX_PAGE_BYTES = 2_000_000;

const RATE_SOURCES = [
  {
    bankKey: 'sbi',
    bank_name: 'State Bank of India',
    loan_type: 'home',
    product_name: 'Home Loan',
    url: 'https://sbi.bank.in/web/interest-rates/interest-rates',
    parser: 'sbi-cards',
    cardIndex: 0,
  },
  {
    bankKey: 'sbi',
    bank_name: 'State Bank of India',
    loan_type: 'personal',
    product_name: 'Personal Loan',
    url: 'https://sbi.bank.in/web/interest-rates/interest-rates',
    parser: 'sbi-cards',
    cardIndex: 1,
  },
  {
    bankKey: 'hdfc',
    bank_name: 'HDFC Bank',
    loan_type: 'home',
    product_name: 'Home Loan',
    url: 'https://www.hdfc.com/housing-loans/home-loan-interest-rates',
    parser: 'hdfc-home',
  },
  {
    bankKey: 'hdfc',
    bank_name: 'HDFC Bank',
    loan_type: 'personal',
    product_name: 'Personal Loan',
    url: 'https://www.hdfcbank.com/personal/borrow/popular-loans/personal-loan',
    parser: 'page-title',
  },
  {
    bankKey: 'icici',
    bank_name: 'ICICI Bank',
    loan_type: 'home',
    product_name: 'Home Loan',
    url: 'https://www.icici.bank.in/personal-banking/loans/home-loan/interest-rates',
    parser: 'page-title',
  },
  {
    bankKey: 'icici',
    bank_name: 'ICICI Bank',
    loan_type: 'personal',
    product_name: 'Personal Loan',
    url: 'https://www.icici.bank.in/personal-banking/loans/personal-loan/personal-loan-interest-rates',
    parser: 'page-title',
  },
  {
    bankKey: 'axis',
    bank_name: 'Axis Bank',
    loan_type: 'home',
    product_name: 'Home Loan',
    url: 'https://www.axis.bank.in/loans/home-loan/interest-rates-charges',
    parser: 'page-title-or-product-copy',
  },
  {
    bankKey: 'axis',
    bank_name: 'Axis Bank',
    loan_type: 'personal',
    product_name: 'Personal Loan',
    url: 'https://www.axis.bank.in/loans/personal-loan/interest-rates-charges',
    parser: 'page-title',
  },
  {
    bankKey: 'canara',
    bank_name: 'Canara Bank',
    loan_type: 'home',
    product_name: 'Housing Loan',
    url: 'https://www.canarabank.bank.in/pages/interest-rate-range-on-loans',
    parser: 'canara-table',
    rowLabel: 'Housing Loan',
  },
  {
    bankKey: 'canara',
    bank_name: 'Canara Bank',
    loan_type: 'car',
    product_name: 'Vehicle Loan',
    url: 'https://www.canarabank.bank.in/pages/interest-rate-range-on-loans',
    parser: 'canara-table',
    rowLabel: 'Canara Vehicle',
  },
];

let cachedOffers = [];
let cachedAt = 0;
let refreshPromise = null;

const decodeEntities = (value) => value
  .replace(/&nbsp;|&#160;/gi, ' ')
  .replace(/&amp;/gi, '&')
  .replace(/&ndash;|&#8211;/gi, '-')
  .replace(/&mdash;|&#8212;/gi, '-')
  .replace(/&rsquo;|&#8217;/gi, "'")
  .replace(/&quot;|&#34;/gi, '"')
  .replace(/&#39;|&apos;/gi, "'")
  .replace(/&lt;/gi, '<')
  .replace(/&gt;/gi, '>');

const extractTitle = (html) => {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? decodeEntities(match[1].replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim() : '';
};

const htmlToText = (html) => decodeEntities(
  html
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<(script|style|noscript|svg)[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<\/(?:td|th|tr|li|p|div|h[1-6])\s*>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
).replace(/\s+/g, ' ').trim();

const getSourceDate = (source, title, text) => {
  if (source.parser === 'canara-table') {
    const effectiveMatch = text.match(/interest rate range of contracted loans\s+w\.e\.f\.?\s*(\d{1,2}[./-]\d{1,2}[./-]\d{2,4})/i);
    if (effectiveMatch) return effectiveMatch[1];
  }

  const updatedMatch = text.match(/last updated on\s*:?\s*(?:[A-Za-z]+,?\s*)?(\d{1,2}[./-]\d{1,2}[./-]\d{2,4})/i);
  if (updatedMatch) return updatedMatch[1];

  const monthMatch = title.match(/\b(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)\s+20\d{2}\b/i);
  return monthMatch ? monthMatch[0] : null;
};

const parseStartingRate = (title, text, source) => {
  if (source.parser === 'hdfc-home') {
    const officialOffer = text.match(/HDFC Bank offers low home finance interest rates starting from\s*([0-9]{1,2}(?:\.[0-9]{1,2})?)\s*\*?\s*%/i);
    if (officialOffer) return { interest_rate: Number(officialOffer[1]), rate_max: null, rate_kind: 'from' };
  }

  const titleRate = title.match(/\b(?:starting|starts?)\s*(?:from|at|@)\s*([0-9]{1,2}(?:\.[0-9]{1,2})?)\s*%/i);
  if (titleRate) return { interest_rate: Number(titleRate[1]), rate_max: null, rate_kind: 'from' };

  if (source.parser === 'page-title-or-product-copy' && source.loan_type === 'home') {
    const productCopy = text.match(/(?:home loan|housing loan)[^.!]{0,140}?interest rates? start(?:s)? from as low as\s*([0-9]{1,2}(?:\.[0-9]{1,2})?)\s*%/i);
    if (productCopy) return { interest_rate: Number(productCopy[1]), rate_max: null, rate_kind: 'from' };
  }

  return null;
};

const parseSbiCardRate = (text, cardIndex) => {
  const marker = text.toLowerCase().lastIndexOf('interest rates quick links');
  if (marker < 0) return null;
  const section = text.slice(marker, marker + 2600);
  if (!/home loan\s+personal loan/i.test(section)) return null;

  const productListEnd = section.toLowerCase().indexOf('agriculture loans');
  if (productListEnd < 0) return null;
  const cardRates = [...section.slice(productListEnd).matchAll(/\b([0-9]{1,2}(?:\.[0-9]{1,2})?)\s*%/g)]
    .map((match) => Number(match[1]))
    .filter((rate) => rate > 0 && rate <= 30);
  const rate = cardRates[cardIndex];
  return rate ? { interest_rate: rate, rate_max: null, rate_kind: 'from' } : null;
};

const parseCanaraRate = (text, rowLabel) => {
  const tableStart = text.search(/interest rate range of contracted loans/i);
  if (tableStart < 0) return null;
  const table = text.slice(tableStart, tableStart + 1400);
  const escapedLabel = rowLabel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = table.match(new RegExp(`${escapedLabel}\\s+([0-9]{1,2}(?:\\.[0-9]{1,2})?)\\s*%\\s*to\\s*([0-9]{1,2}(?:\\.[0-9]{1,2})?)\\s*%`, 'i'));
  if (!match) return null;
  return { interest_rate: Number(match[1]), rate_max: Number(match[2]), rate_kind: 'range' };
};

const stableLoanId = (key) => {
  const hash = createHash('sha1').update(key).digest();
  hash[6] = (hash[6] & 0x0f) | 0x50;
  hash[8] = (hash[8] & 0x3f) | 0x80;
  const hex = hash.subarray(0, 16).toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};

const parseSource = (source, html, checkedAt) => {
  const title = extractTitle(html);
  const text = htmlToText(html);
  let parsed;

  if (source.parser === 'sbi-cards') {
    parsed = parseSbiCardRate(text, source.cardIndex);
  } else if (source.parser === 'canara-table') {
    parsed = parseCanaraRate(text, source.rowLabel);
  } else {
    parsed = parseStartingRate(title, text, source);
  }

  if (!parsed || parsed.interest_rate <= 0 || parsed.interest_rate > 30) return null;
  if (parsed.rate_max !== null && (parsed.rate_max < parsed.interest_rate || parsed.rate_max > 30)) return null;

  return {
    id: stableLoanId(`${source.bankKey}:${source.loan_type}:${source.product_name}`),
    bank_name: source.bank_name,
    product_name: source.product_name,
    loan_type: source.loan_type,
    interest_rate: parsed.interest_rate,
    rate_max: parsed.rate_max,
    rate_kind: parsed.rate_kind,
    source_url: source.url,
    source_title: title || source.bank_name,
    source_as_of: getSourceDate(source, title, text),
    checked_at: checkedAt,
  };
};

const fetchPage = async (url) => {
  const response = await fetch(url, {
    headers: {
      Accept: 'text/html,application/xhtml+xml',
      'User-Agent': 'Mozilla/5.0 (compatible; LoanRateComparison/1.0)',
    },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`Bank page returned HTTP ${response.status}`);

  const contentLength = Number(response.headers.get('content-length'));
  if (Number.isFinite(contentLength) && contentLength > MAX_PAGE_BYTES) {
    throw new Error('Bank page exceeded the supported size limit');
  }

  const html = await response.text();
  if (Buffer.byteLength(html, 'utf8') > MAX_PAGE_BYTES) {
    throw new Error('Bank page exceeded the supported size limit');
  }
  return html;
};

const fetchOfficialRates = async ({ forceRefresh = false } = {}) => {
  if (!forceRefresh && cachedOffers.length > 0 && Date.now() - cachedAt < CACHE_TTL_MS) {
    return cachedOffers;
  }
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const pageUrls = [...new Set(RATE_SOURCES.map((source) => source.url))];
    const pages = new Map();
    await Promise.all(pageUrls.map(async (url) => {
      try {
        pages.set(url, await fetchPage(url));
      } catch (error) {
        console.warn(`[bank-rates] Unable to read ${new URL(url).hostname}: ${error.message}`);
      }
    }));

    const checkedAt = new Date().toISOString();
    const offers = RATE_SOURCES
      .map((source) => {
        const html = pages.get(source.url);
        return html ? parseSource(source, html, checkedAt) : null;
      })
      .filter(Boolean)
      .sort((a, b) => a.interest_rate - b.interest_rate || a.bank_name.localeCompare(b.bank_name));

    if (offers.length === 0) {
      const error = new Error('Could not verify current loan rates from the official bank pages. Please try again shortly.');
      error.statusCode = 502;
      throw error;
    }

    cachedOffers = offers;
    cachedAt = Date.now();
    return offers;
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
};

module.exports = { fetchOfficialRates };
