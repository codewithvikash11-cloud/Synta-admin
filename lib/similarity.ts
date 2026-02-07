import { compareTwoStrings } from 'string-similarity';

export function calculateSimilarity(text1: string, text2: string): number {
    return compareTwoStrings(text1 || '', text2 || '') * 100;
}
