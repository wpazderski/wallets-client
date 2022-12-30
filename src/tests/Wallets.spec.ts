import * as puppeteer from "puppeteer";

import { Config } from "./_Config";
import {
    clickSidebarElement,
    clickTestId,
    createTestWallet,
    deleteTestWallet,
    getElementAttribute,
    loginAsRoot,
    typeTestIdDescendantInput,
    wait,
} from "./_Utils";





jest.setTimeout(30000);

describe("Wallets", () => {
    
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
        await clickSidebarElement(page, "/wallets");
    });
    
    describe("creating wallet", () => {
        
        it("should work", async () => {
            const wallet = {
                name: `test_${Date.now()}_${Math.random().toString(36).substr(2)}`,
                description: `testdescr ${Date.now()} ${Math.random().toString(36).substr(2)}`,
            };
            
            // Create wallet
            await clickTestId(page, "Wallets__add");
            await typeTestIdDescendantInput(page, "Wallets__add__name", wallet.name);
            await typeTestIdDescendantInput(page, "Wallets__add__description", wallet.description, { textarea: true });
            await clickTestId(page, "Wallets__add__save");
            const walletId = await getElementAttribute(page, `[data-testid='Wallets__row__name'][data-wallet-name='${wallet.name}']`, "data-wallet-id");
            
            // Verify
            expect(typeof walletId).toEqual("string");
            expect(walletId.length).toBeGreaterThan(5);
            
            await wait(500);
            await deleteTestWallet(page, walletId);
        });
        
    });
    
    describe("editing wallet", () => {
        
        it("should work", async () => {
            const wallet = await createTestWallet(page);
            const newName = `${wallet.name}-2`;
            const newDescription = `${wallet.description}-2`;
            
            // Open edit form
            await wait(500);
            await clickSidebarElement(page, "/wallets");
            const editButtonSelector = `[data-testid="Wallets__edit"][data-wallet-id="${wallet.id}"]`;
            const button = (await page.waitForSelector(editButtonSelector))!;
            await button.click();
            
            // Change name and description
            await typeTestIdDescendantInput(page, "Wallets__add__name", newName, { clear: true });
            await typeTestIdDescendantInput(page, "Wallets__add__description", newDescription, { clear: true, textarea: true });
            await clickTestId(page, "Wallets__add__save");
            
            // Verify
            const walletId1 = await getElementAttribute(page, `[data-testid='Wallets__row__name'][data-wallet-name='${newName}']`, "data-wallet-id");
            const walletId2 = await getElementAttribute(page, `[data-testid='Wallets__row__description'][data-wallet-description='${newDescription}']`, "data-wallet-id");
            expect(walletId1).toEqual(wallet.id);
            expect(walletId2).toEqual(wallet.id);
            
            await wait(500);
            await deleteTestWallet(page, wallet.id);
        });
        
    });
    
    describe("deleting wallet", () => {
        
        it("should work", async () => {
            const wallet = await createTestWallet(page);
            const walletRowSelector = `[data-testid='Wallets__row__name'][data-wallet-id='${wallet.id}']`;
            
            // Delete wallet
            await loginAsRoot(page);
            await clickSidebarElement(page, "/wallets");
            const deleteButtonSelector = `[data-testid="Wallets__delete"][data-wallet-id="${wallet.id}"]`;
            const button = (await page.waitForSelector(deleteButtonSelector))!;
            await button.click();
            await clickTestId(page, "Wallets__delete-dialog__yes");
            
            // Verify
            await page.waitForSelector(walletRowSelector, { hidden: true });
        });
        
    });
    
});
