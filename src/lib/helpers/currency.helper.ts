export function formatAmount(amount: string | number) {
    console.log('Formatting amount:', amount);
    return new Intl.NumberFormat('fr-FR', {style: 'currency', currency: 'XOF'}).format(Number(amount));
}

export function getCurrencySymbol(amount: string | number) {
    return formatAmount(amount).replace("0", "");
}