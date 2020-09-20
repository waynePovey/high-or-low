export default class Utils {
    constructor() {}

    public static degreesToRads(degrees: number): number {
        return degrees * Math.PI / 180;
    }

    public static random(value: number): number {
        return Math.random() * value;
    }

    public static randomInRange(lower: number, upper: number): number {
        return Math.random() * (upper - lower) + lower;
    }

    public static uniqueRandNumInRange(original: number, lower: number, upper: number): number {
        let newNumber = Math.round(Utils.randomInRange(lower, upper));
        while (newNumber === original) {
          newNumber = Math.round(Utils.randomInRange(lower, upper));
        }
        return newNumber;
    }
}
