import * as puppeteer from "puppeteer";

import { Config } from "./_Config";
import {
    clickSidebarElement,
    clickTestId,
    createTestInvestmentType,
    deleteTestInvestmentType,
    getElementAttribute,
    loginAsRoot,
    typeTestIdDescendantInput,
    wait,
} from "./_Utils";





jest.setTimeout(30000);

describe("InvestmentTypes", () => {
    
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
        await clickSidebarElement(page, "/investmentTypes");
    });
    
    describe("creating investment type", () => {
        
        it("should work", async () => {
            const randomSuffix = `${Date.now()}${Math.random().toString(36).substr(2)}`;
            const investmentType = {
                name: `test lorem ipsum ${randomSuffix}`,
                slug: `testLoremIpsum${randomSuffix.replace(/ /g, "")}`,
            };
            
            // Create investment type
            await clickTestId(page, "InvestmentTypes__add");
            await typeTestIdDescendantInput(page, "InvestmentTypes__add__name", investmentType.name);
            await clickTestId(page, "InvestmentTypes__add__save");
            const investmentTypeId1 = await getElementAttribute(page, `[data-testid='InvestmentTypes__row__name'][data-investment-type-name='${investmentType.name}']`, "data-investment-type-id");
            const investmentTypeId2 = await getElementAttribute(page, `[data-testid='InvestmentTypes__row__name'][data-investment-type-slug='${investmentType.slug}']`, "data-investment-type-id");
            
            // Verify
            expect(typeof investmentTypeId1).toEqual("string");
            expect(typeof investmentTypeId2).toEqual("string");
            expect(investmentTypeId1.length).toBeGreaterThan(5);
            expect(investmentTypeId2.length).toBeGreaterThan(5);
            expect(investmentTypeId1).toEqual(investmentTypeId2);
            
            await wait(500);
            await deleteTestInvestmentType(page, investmentTypeId1);
        });
        
    });
    
    describe("editing investment type", () => {
        
        it("should work", async () => {
            const investmentType = await createTestInvestmentType(page);
            const newName = `${investmentType.name}-2`;
            const newSlug = `${investmentType.slug}-2`;
            
            // Open edit form
            await wait(500);
            await clickSidebarElement(page, "/investmentTypes");
            const editButtonSelector = `[data-testid="InvestmentTypes__edit"][data-investment-type-id="${investmentType.id}"]`;
            const button = (await page.waitForSelector(editButtonSelector))!;
            await button.click();
            
            // Change name
            await typeTestIdDescendantInput(page, "InvestmentTypes__add__name", newName, { clear: true });
            await clickTestId(page, "InvestmentTypes__add__save");
            
            // Verify
            const investmentTypeId1 = await getElementAttribute(page, `[data-testid='InvestmentTypes__row__name'][data-investment-type-name='${newName}']`, "data-investment-type-id");
            const investmentTypeId2 = await getElementAttribute(page, `[data-testid='InvestmentTypes__row__name'][data-investment-type-slug='${newSlug}']`, "data-investment-type-id");
            expect(investmentTypeId1).toEqual(investmentType.id);
            expect(investmentTypeId2).toEqual(investmentType.id);
            
            await wait(500);
            await deleteTestInvestmentType(page, investmentType.id);
        });
        
    });
    
    describe("deleting investment type", () => {
        
        it("should work", async () => {
            const investmentType = await createTestInvestmentType(page);
            const investmentTypeRowSelector = `[data-testid='InvestmentTypes__row__name'][data-investment-type-id='${investmentType.id}']`;
            
            // Delete investment type
            await loginAsRoot(page);
            await clickSidebarElement(page, "/investmentTypes");
            const deleteButtonSelector = `[data-testid="InvestmentTypes__delete"][data-investment-type-id="${investmentType.id}"]`;
            const button = (await page.waitForSelector(deleteButtonSelector))!;
            await button.click();
            await clickTestId(page, "InvestmentTypes__delete-dialog__yes");
            
            // Verify
            await page.waitForSelector(investmentTypeRowSelector, { hidden: true });
        });
        
    });
    
});
