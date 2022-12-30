import * as puppeteer from "puppeteer";

import { Config } from "./_Config";
import { clickTestId, typeTestIdDescendantInput } from "./_Utils";





jest.setTimeout(30000);

describe("SignIn", () => {
    
    let browser: puppeteer.Browser;
    let page: puppeteer.Page;
    
    beforeAll(async () => {
        browser = await puppeteer.launch(Config.browserLaunchOptions);
        page = await browser.newPage();
    });
    
    afterAll(() => {
        browser.close();
    });
    
    it("should work", async () => {
        await page.goto(Config.baseUrl);
        
        await typeTestIdDescendantInput(page, "SignIn__login", Config.users.root.login);
        await typeTestIdDescendantInput(page, "SignIn__password", Config.users.root.password);
        await clickTestId(page, "SignIn__submit");
        
        await page.waitForSelector("[data-testid='SidebarNavLink:/logout']");
    });
    
});
