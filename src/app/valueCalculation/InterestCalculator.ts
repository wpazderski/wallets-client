import { ExternalDataState } from "../store/ExternalDataSlice";
import { Investment, InvestmentInterestPeriod } from "../store/InvestmentsSlice";
import { Utils } from "../Utils";
import { CalculationUtils } from "./CalculationUtils";





interface InterestPeriodWithInterest {
    interestPeriod: InvestmentInterestPeriod;
    interestPeriodComplete: boolean;
    repeatId: number;
    interest: number;
    interestTotal: number;
}

export class InterestCalculator {
    
    private interestPeriodsWithInterest: InterestPeriodWithInterest[] = [];
    
    constructor(private investment: Investment, private externalData: ExternalDataState) {
    }
    
    getInterestPeriodsWithInterest(): InterestPeriodWithInterest[] {
        return this.interestPeriodsWithInterest;
    }
    
    calculate(): number {
        const purchaseValue = CalculationUtils.calculateInvestmentPurchaseValue(this.investment);
        if (!this.investment.startDate) {
            if (this.investment.interestPeriods.length === 0) {
                return purchaseValue;
            }
            else {
                throw new Error("Missing start date");
            }
        }
        this.interestPeriodsWithInterest = [];
        let time: number = this.investment.startDate;
        let interestTotal: number = 0;
        const now = Date.now();
        for (const interestPeriod of this.investment.interestPeriods) {
            for (let repeatId = 0; repeatId < interestPeriod.repeats; ++repeatId) {
                const startTime = time;
                const endTime = Utils.addDuration(startTime, interestPeriod.duration);
                const interestPeriodInterest = this.calculateInterestPeriodInterest(interestPeriod, startTime, Math.min(endTime, now), purchaseValue, interestTotal);
                interestTotal += interestPeriodInterest;
                this.interestPeriodsWithInterest.push({
                    interestPeriod,
                    interestPeriodComplete: endTime <= now,
                    repeatId,
                    interest: interestPeriodInterest,
                    interestTotal,
                });
                time = endTime;
                if (time >= now) {
                    // All subsequent interest periods are in the future
                    break;
                }
            }
            if (time >= now) {
                // All subsequent interest periods are in the future
                break;
            }
        }
        return purchaseValue + interestTotal;
    }
    
    private calculateInterestPeriodInterest(interestPeriod: InvestmentInterestPeriod, startTime: number, endTime: number, purchaseValue: number, interestTotal: number): number {
        const dt = new Date(startTime);
        const day = dt.getDate();
        const month = dt.getMonth() + 1;
        const year = dt.getFullYear();
        
        const dtNextYear = new Date(startTime);
        dtNextYear.setFullYear(dtNextYear.getFullYear() + 1);
        const durationYears = CalculationUtils.getNumYearsPassed(startTime, endTime);
        
        const additivePercent = interestPeriod.interestRate.additivePercent;
        const additiveInflation = interestPeriod.interestRate.additiveInflation ? this.getInflationRate(month - 1, year) : 0; // Use inflation rate for the previous month
        const additiveReferenceRate = interestPeriod.interestRate.additiveReferenceRate ? this.getReferenceRate(day, month, year) : 0;
        const interestRate = (additivePercent + additiveInflation + additiveReferenceRate) / 100 * durationYears;
        
        const baseValue = this.investment.capitalization ? (purchaseValue + interestTotal) : purchaseValue;
        const interest = interestRate * baseValue;
        return interest;
    }
    
    private getInflationRate(month: number, year: number): number {
        let inflationRate: number = 0;
        for (const monthlyInflationRate of this.externalData.monthlyInflationRates) {
            if (monthlyInflationRate.year < year) {
                inflationRate = monthlyInflationRate.inflationRate;
                continue;
            }
            if (monthlyInflationRate.year > year) {
                break;
            }
            if (monthlyInflationRate.month <= month) {
                inflationRate = monthlyInflationRate.inflationRate;
                continue;
            }
            if (monthlyInflationRate.month > month) {
                break;
            }
        }
        return inflationRate;
    }
    
    private getReferenceRate(day: number, month: number, year: number): number {
        let referenceRate: number = 0;
        for (const monthlyReferenceRate of this.externalData.monthlyReferenceRates) {
            if (monthlyReferenceRate.year < year) {
                referenceRate = monthlyReferenceRate.referenceRate;
                continue;
            }
            if (monthlyReferenceRate.year > year) {
                break;
            }
            if (monthlyReferenceRate.month < month) {
                referenceRate = monthlyReferenceRate.referenceRate;
                continue;
            }
            if (monthlyReferenceRate.month > month) {
                break;
            }
            if (monthlyReferenceRate.day <= day) {
                referenceRate = monthlyReferenceRate.referenceRate;
                continue;
            }
            if (monthlyReferenceRate.day > day) {
                break;
            }
        }
        return referenceRate;
    }
    
}
