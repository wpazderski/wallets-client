export type DurationUnit = "m" | "y";

export interface Duration {
    num: number;
    unit: DurationUnit;
}
