export class ChartColors {
    
    private colors: string[] = [
        "rgb(  0,  80, 141)",
        "rgb(161,  45,  45)",
        "rgb( 14, 175, 138)",
        "rgb(133,  52, 119)",
        "rgb( 58,  58,  58)",
        "rgb(207, 103,  13)",
        "rgb(164, 191,  16)",
        "rgb(239, 213,  29)",
        "rgb(124, 124, 124)",
        "rgb(  0, 173, 225)",
        "rgb( 58, 155,  79)",
        "rgb(107,  14, 255)",
    ];
    private nextColorId: number = 0;
    
    next(): string {
        const colorId = this.nextColorId;
        this.nextColorId = (this.nextColorId + 1) % this.colors.length;
        return this.colors[colorId];
    }
    
    reset(): void {
        this.nextColorId = 0;
    }
    
}
