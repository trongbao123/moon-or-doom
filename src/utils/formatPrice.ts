const formatPrice = (price: number) => {
    const formattedPrice = price.toLocaleString('de-DE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })
    return formattedPrice
}

export { formatPrice }
