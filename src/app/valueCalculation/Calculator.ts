import { ExternalDataState } from "../store/ExternalDataSlice";
import {
    Investment,
    InvestmentCancellationPolicy,
    InvestmentInterestPeriodCancellationPolicy,
    InvestmentValueCalculationMethod_Cryptocurrency,
    InvestmentValueCalculationMethod_Obtainer,
} from "../store/InvestmentsSlice";
import { UserSettingsState } from "../store/UserSettingsSlice";
import { Utils } from "../Utils";
import { CalculationUtils } from "./CalculationUtils";
import { InterestCalculator } from "./InterestCalculator";





export class Calculator {
    
    private interestCalculator: InterestCalculator | null = null;
    
    constructor(private investment: Investment, private externalData: ExternalDataState, private userSettings: UserSettingsState) {
    }
    
    calculate(): number {
        const grossValue = this.calculateGrossValue();
        const netValue = this.calculateNetValue(grossValue);
        return netValue;
    }
    
    private calculateNetValue(grossValue: number): number {
        let value = grossValue;
        
        if (this.userSettings.includeCancellationFees) {
            const applicable = !this.investment.endDate || (Date.now() < this.investment.endDate);
            if (applicable) {
                value = this.subtractCancellationFees(value);
            }
        }
        
        if (this.userSettings.includeIncomeTax && this.userSettings.incomeTaxRate > 0 && this.investment.incomeTaxApplicable) {
            value = this.subtractIncomeTax(value);
        }
        
        return value;
    }
    
    private calculateGrossValue(): number {
        if (this.investment.valueCalculationMethod.type === "manual") {
            return this.investment.valueCalculationMethod.currentValue;
        }
        else if (this.investment.valueCalculationMethod.type === "obtainer") {
            return this.calculateWithObtainer(this.investment.valueCalculationMethod);
        }
        else if (this.investment.valueCalculationMethod.type === "cryptocurrency") {
            return this.calculateWithCryptocurrency(this.investment.valueCalculationMethod);
        }
        else if (this.investment.valueCalculationMethod.type === "interest") {
            return this.calculateFromInterest();
        }
        return 0;
    }
    
    private calculateWithObtainer(data: InvestmentValueCalculationMethod_Obtainer): number {
        const tickerData = this.externalData.tickerData.find(tickerData => tickerData.ticker === data.ticker);
        if (!tickerData) {
            return -1;
        }
        const unitValue = tickerData.value;
        let numUnits: number;
        if (this.investment.purchase.type === "decimalUnits" || this.investment.purchase.type === "integerUnits") {
            numUnits = this.investment.purchase.numUnits;
        }
        else if (this.investment.purchase.type === "weight") {
            numUnits = this.investment.purchase.weight;
        }
        else {
            return -1;
        }
        const value = unitValue * numUnits;
        return value;
    }
    
    private calculateWithCryptocurrency(data: InvestmentValueCalculationMethod_Cryptocurrency): number {
        const cryptocurrencyExchangeRate = this.externalData.cryptocurrencyExchangeRates[data.cryptocurrencyId];
        if (typeof(cryptocurrencyExchangeRate) !== "number") {
            return -1;
        }
        const unitValue = cryptocurrencyExchangeRate;
        let numUnits: number;
        if (this.investment.purchase.type === "decimalUnits" || this.investment.purchase.type === "integerUnits") {
            numUnits = this.investment.purchase.numUnits;
        }
        else {
            return -1;
        }
        const value = unitValue * numUnits;
        return value;
    }
    
    private calculateFromInterest(): number {
        this.interestCalculator = new InterestCalculator(this.investment, this.externalData);
        return this.interestCalculator.calculate();
    }
    
    private subtractCancellationFees(value: number): number {
        let cancellationPolicy: InvestmentCancellationPolicy | InvestmentInterestPeriodCancellationPolicy | null = null;
        if (this.investment.interestPeriods.length > 0) {
            if (this.investment.startDate) {
                let time: number = this.investment.startDate;
                const now = Date.now();
                for (const interestPeriod of this.investment.interestPeriods) {
                    for (let repeatId = 0; repeatId < interestPeriod.repeats; ++repeatId) {
                        time = Utils.addDuration(time, interestPeriod.duration);
                        if (now < time) {
                            cancellationPolicy = interestPeriod.cancellationPolicy;
                            break;
                        }
                    }
                    if (cancellationPolicy) {
                        break;
                    }
                }
            }
        }
        else {
            cancellationPolicy = this.investment.cancellationPolicy;
        }
        if (cancellationPolicy) {
            const purchaseValue = CalculationUtils.calculateInvestmentPurchaseValue(this.investment);
            const totalInterest = value - purchaseValue;
            let fee = cancellationPolicy.fixedPenalty + cancellationPolicy.percentOfTotalInterest / 100 * totalInterest;
            if ("percentOfInterestPeriodInterest" in cancellationPolicy) {
                let interestPeriodInterest: number | null = null;
                if (this.interestCalculator) {
                    const interestPeriodsWithInterest = this.interestCalculator.getInterestPeriodsWithInterest();
                    const lastInterestPeriod = interestPeriodsWithInterest[interestPeriodsWithInterest.length - 1];
                    if (lastInterestPeriod) {
                        interestPeriodInterest = lastInterestPeriod.interest;
                    }
                }
                if (interestPeriodInterest !== null) {
                    fee += cancellationPolicy.percentOfInterestPeriodInterest / 100 * interestPeriodInterest;
                    if (cancellationPolicy.limitedToInterestPeriodInterest) {
                        fee = Math.min(fee, interestPeriodInterest);
                    }
                }
            }
            if (cancellationPolicy.limitedToTotalInterest) {
                fee = Math.min(fee, totalInterest);
            }
            fee = Math.max(fee, 0);
            value -= fee;
        }
        return value;
    }
    
    private subtractIncomeTax(value: number): number {
        const purchaseValue = CalculationUtils.calculateInvestmentPurchaseValue(this.investment);
        const taxableAmount = value - purchaseValue;
        let tax = taxableAmount * this.userSettings.incomeTaxRate / 100;
        tax = Math.max(tax, 0);
        value = value - tax;
        return value;
    }
    
}
