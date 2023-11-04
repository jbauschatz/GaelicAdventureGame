
function randomInt(max: number) {
    return Math.floor(Math.random() * max);
}

export function pickOne<T>(items: Array<T>): T {
    return items[randomInt(items.length)];
}