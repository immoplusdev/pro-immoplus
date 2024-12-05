export type Props = {
    value: number;
}

export function Amount({value}: Props) {
    const amountText = new Intl.NumberFormat("fr-FR", {
        style: 'currency',
        currency: "XOF",
        maximumFractionDigits: 0,
    }).format(value);

    return (
        <span>{amountText}</span>
    )
}
