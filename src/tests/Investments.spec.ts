import * as puppeteer from "puppeteer";

import { Config } from "./_Config";
import {
    clickSidebarElement,
    clickTestId,
    createTestInvestment,
    deleteTestInvestment,
    getElementAttribute,
    loginAsRoot,
    typeTestIdDescendantInput,
    wait,
} from "./_Utils";





jest.setTimeout(30000);

describe("Investments", () => {
    
    let browser: puppeteer.Browser;
    let page: puppeteer.Page;
    
    beforeAll(async () => {
        browser = await puppeteer.launch(Config.browserLaunchOptions);
        page = await browser.newPage();
    });
    
    afterAll(() => {
        browser.close();
    });
    
    beforeEach(async () => {
        await loginAsRoot(page);
        await clickSidebarElement(page, "/investments/deposits");
    });
    
    describe("creating investment", () => {
        
        it("should work", async () => {
            const randomSuffix = `${Date.now()}${Math.random().toString(36).substr(2)}`;
            const investment = {
                name: `test lorem ipsum ${randomSuffix}`,
            };
            
            // Create investment
            await clickTestId(page, "Investments__add");
            await typeTestIdDescendantInput(page, "Investments__add__name", investment.name);
            await clickTestId(page, "Investments__add__save");
            const investmentId = await getElementAttribute(page, `[data-testid='Investments__row__name'][data-investment-name='${investment.name}']`, "data-investment-id");
            
            // Verify
            expect(typeof investmentId).toEqual("string");
            expect(investmentId.length).toBeGreaterThan(5);
            
            await wait(500);
            await deleteTestInvestment(page, investmentId, "deposits");
        });
        
    });
    
    describe("editing investment", () => {
        
        it("should work", async () => {
            const investment = await createTestInvestment(page, "deposits");
            const newName = `${investment.name}-2`;
            
            // Open edit form
            await wait(500);
            await clickSidebarElement(page, "/investments/deposits");
            const editButtonSelector = `[data-testid="Investments__edit"][data-investment-id="${investment.id}"]`;
            const button = (await page.waitForSelector(editButtonSelector))!;
            await button.click();
            
            // Change name
            await typeTestIdDescendantInput(page, "Investments__add__name", newName, { clear: true });
            await clickTestId(page, "Investments__add__save");
            
            // Verify
            const investmentId = await getElementAttribute(page, `[data-testid='Investments__row__name'][data-investment-name='${newName}']`, "data-investment-id");
            expect(investmentId).toEqual(investment.id);
            
            await wait(500);
            await deleteTestInvestment(page, investment.id, "deposits");
        });
        
    });
    
    describe("deleting investment", () => {
        
        it("should work", async () => {
            const investment = await createTestInvestment(page, "deposits");
            const investmentRowSelector = `[data-testid='Investments__row__name'][data-investment-id='${investment.id}']`;
            
            // Delete investment
            await loginAsRoot(page);
            await clickSidebarElement(page, "/investments/deposits");
            const deleteButtonSelector = `[data-testid="Investments__delete"][data-investment-id="${investment.id}"]`;
            const button = (await page.waitForSelector(deleteButtonSelector))!;
            await button.click();
            await clickTestId(page, "Investments__delete-dialog__yes");
            
            // Verify
            await page.waitForSelector(investmentRowSelector, { hidden: true });
        });
        
    });
    
});
