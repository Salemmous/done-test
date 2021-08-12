export function chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    let bufferArray: T[] = [];
    array.forEach((value) => {
        bufferArray.push(value);
        if (bufferArray.length < chunkSize) return;
        chunks.push(bufferArray);
        bufferArray = [];
    });
    if (bufferArray.length) chunks.push(bufferArray);
    return chunks;
}
