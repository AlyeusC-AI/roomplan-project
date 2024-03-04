const devPriceMap: { [key: string]: string } = {
    basic: 'price_1M2zNlK33c1hxHakDcdJimYl',
    pro: 'price_1MS8qdK33c1hxHakzeJ2Pbvr',
    oneTimeRoofPurchasePro: 'price_1MrVlwK33c1hxHakPh28YYZu',
    oneTimeRoofPurchaseFree: 'price_1MrX0gK33c1hxHakTS8GXNUm',
}

const prodPriceMap: { [key: string]: string } = {
    basic: 'price_1M2zSrK33c1hxHakJVMLuJwg',
    pro: 'price_1MS8t8K33c1hxHakqTYTkHST',
    oneTimeRoofPurchasePro: 'price_1MrW73K33c1hxHak9rMmEk7T',
    oneTimeRoofPurchaseFree: 'price_1MrWzuK33c1hxHakYJCqXKGE',
}

export const getStripePriceFromClientID = (clientId: string) => {
    if (process.env.NODE_ENV === 'development') {
        return devPriceMap[clientId]
    }
    return prodPriceMap[clientId]
}
