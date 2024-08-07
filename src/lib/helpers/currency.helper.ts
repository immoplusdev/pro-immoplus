export function formatAmount(amount: string | number){
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(Number(amount));
}