import { Investment } from "../store/InvestmentsSlice";

export class CalculationUtils {
    
    static calculateInvestmentPurchaseValue(investment: Investment): number {
        let purchaseValue: number;
        if (investment.purchase.type === "anyAmountOfMoney") {
            purchaseValue = investment.purchase.amountOfMoney;
        }
        else if (investment.purchase.type === "decimalUnits" || investment.purchase.type === "integerUnits") {
            purchaseValue = investment.purchase.unitPrice * investment.purchase.numUnits;
        }
        else {
            purchaseValue = investment.purchase.price * investment.purchase.weight;
        }
        return purchaseValue;
    }
    
    static getNumYearsPassed(startTime: number, endTime: number): number {
        const dtStart = new Date(startTime);
        const dtEnd = new Date(endTime);
        if (dtStart.getDate() === dtEnd.getDate()) {
            const fullYears = dtEnd.getFullYear() - dtStart.getFullYear();
            const fullMonths = dtEnd.getMonth() - dtStart.getMonth();
            const durationYears = fullYears + fullMonths / 12;
            return durationYears;
        }
        
        const dtNextYear = new Date(startTime);
        dtNextYear.setFullYear(dtNextYear.getFullYear() + 1);
        const durationYears = (endTime - startTime) / (dtNextYear.getTime() - dtStart.getTime());
        return durationYears;
    }
    
}
