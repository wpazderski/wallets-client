import * as puppeteer from "puppeteer";

import { Config } from "./_Config";
import { clickSidebarElement, loginAsRoot } from "./_Utils";





jest.setTimeout(30000);

describe("SignOut", () => {
    
    let browser: puppeteer.Browser;
    let page: puppeteer.Page;
    
    beforeAll(async () => {
        browser = await puppeteer.launch(Config.browserLaunchOptions);
        page = await browser.newPage();
    });
    
    afterAll(() => {
        browser.close();
    });
    
    it("works", async () => {
        await loginAsRoot(page);
        
        await clickSidebarElement(page, "/logout");
        
        await page.waitForSelector("[data-testid='SignIn__login']");
    });
    
});
