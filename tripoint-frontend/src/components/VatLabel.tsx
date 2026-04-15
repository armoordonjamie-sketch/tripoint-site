/** Inline ex-VAT indicator for displayed prices. */
export function VatLabel() {
    return <span className="ml-0.5 text-xs font-normal text-text-muted">+ VAT</span>;
}

/** For template literals where JSX cannot be used (e.g. button labels). */
export const vatSuffix = ' + VAT';
