import * as puppeteer from "puppeteer";

import { Config } from "./_Config";
import {
    clickSidebarElement,
    clickTestId,
    createTestUser,
    deleteTestUser,
    getElementAttribute,
    loginAsRoot,
    typeTestIdDescendantInput,
} from "./_Utils";





jest.setTimeout(30000);

describe("Users", () => {
    
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
        await clickSidebarElement(page, "/users");
    });
    
    describe("creating user", () => {
        
        it("should work", async () => {
            const user = {
                login: `test_${Date.now()}_${Math.random().toString(36).substr(2)}`,
                password: "test1234",
            };
            
            // Create user
            await clickTestId(page, "UsersList__add");
            await typeTestIdDescendantInput(page, "UserCreate__login", user.login);
            await clickTestId(page, "UserCreate__submit");
            await page.waitForSelector("[data-testid='UsersList__table']");
            const userId = await getElementAttribute(page, `[data-testid='UsersList__table'] [data-testid='UsersList__row__login'][data-user-login='${user.login}']`, "data-user-id");
            
            // Verify
            expect(typeof userId).toEqual("string");
            expect(userId.length).toBeGreaterThan(5);
            
            await deleteTestUser(page, userId);
        });
        
    });
    
    describe("editing user", () => {
        
        it("should work", async () => {
            const user = await createTestUser(page);
            const newLogin = `${user.login}-2`;
            
            // Open edit form
            await loginAsRoot(page);
            await clickSidebarElement(page, "/users");
            const editButtonSelector = `[data-testid="UsersList__edit"][data-user-id="${user.id}"]`;
            const button = (await page.waitForSelector(editButtonSelector))!;
            await button.click();
            
            // Change login
            await typeTestIdDescendantInput(page, "UserEdit__login", newLogin, { clear: true });
            await clickTestId(page, "UserEdit__submit");
            
            // Verify
            const userId = await getElementAttribute(page, `[data-testid='UsersList__table'] [data-testid='UsersList__row__login'][data-user-login='${newLogin}']`, "data-user-id");
            expect(userId).toEqual(user.id);
            
            await deleteTestUser(page, user.id);
        });
        
    });
    
    describe("deleting user", () => {
        
        it("should work", async () => {
            const user = await createTestUser(page);
            const userRowSelector = `[data-testid='UsersList__table'] [data-testid='UsersList__row__login'][data-user-id='${user.id}']`;
            
            // Delete user
            await loginAsRoot(page);
            await clickSidebarElement(page, "/users");
            const deleteButtonSelector = `[data-testid="UsersList__delete"][data-user-id="${user.id}"]`;
            const button = (await page.waitForSelector(deleteButtonSelector))!;
            await button.click();
            await clickTestId(page, "UsersList__delete-dialog__yes");
            
            // Verify
            await page.waitForSelector(userRowSelector, { hidden: true });
        });
        
    });
    
});
