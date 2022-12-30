import * as puppeteer from "puppeteer";

import { Config } from "./_Config";





export async function wait(msec: number): Promise<void> {
    return new Promise<void>(resolve => {
        setTimeout(() => {
            resolve();
        }, msec);
    });
}

export async function loginAsRoot(page: puppeteer.Page): Promise<void> {
    await login(page, Config.users.root.login, Config.users.root.password);
}

export async function login(page: puppeteer.Page, login: string, password: string): Promise<void> {
    await page.goto(Config.baseUrl);
    await page.waitForSelector("[data-testid='SignIn__login'] input");
    await page.waitForSelector("[data-testid='SignIn__password'] input");
    await page.waitForSelector("[data-testid='SignIn__submit']");
    await page.type("[data-testid='SignIn__login'] input", login);
    await page.type("[data-testid='SignIn__password'] input", password);
    await page.click("[data-testid='SignIn__submit']");
}

export async function logout(page: puppeteer.Page): Promise<void> {
    await clickSidebarElement(page, "/logout");
}

export async function clickSidebarElement(page: puppeteer.Page, relativeUrl: string): Promise<void> {
    await page.waitForSelector(`[data-testid='SidebarNavLink:${relativeUrl}']`);
    await page.click(`[data-testid='SidebarNavLink:${relativeUrl}']`);
}

export async function clickTestId(page: puppeteer.Page, testId: string): Promise<void> {
    await page.waitForSelector(`[data-testid='${testId}']`);
    await page.click(`[data-testid='${testId}']`);
}

export async function typeTestIdDescendantInput(page: puppeteer.Page, testId: string, text: string, options?: { clear?: boolean, textarea?: boolean }): Promise<void> {
    await page.waitForSelector(`[data-testid='${testId}']`);
    if (options?.clear) {
        await clearTestIdDescendantInput(page, testId, { textarea: options.textarea });
    }
    await page.type(`[data-testid='${testId}'] ${options?.textarea ? "textarea" : "input"}`, text);
}

export async function clearTestIdDescendantInput(page: puppeteer.Page, testId: string, options?: { textarea?: boolean }): Promise<void> {
    const input = (await page.waitForSelector(`[data-testid='${testId}'] ${options?.textarea ? "textarea" : "input"}`))!;
    await input.focus();
    await page.keyboard.down("Control");
    await page.keyboard.press("A");
    await page.keyboard.up("Control");
    await page.keyboard.press("Backspace");
}

export async function getTestIdText(page: puppeteer.Page, testId: string): Promise<string> {
    const passwordInput = await page.waitForSelector(`[data-testid='${testId}']`);
    return await passwordInput!.evaluate(el => el.textContent ?? "");
}

export async function getElementTextContent(page: puppeteer.Page, selector: string): Promise<string> {
    const input = await page.waitForSelector(selector);
    return await input!.evaluate((el) => el.textContent ?? "");
}

export async function getElementAttribute(page: puppeteer.Page, selector: string, attributeName: string): Promise<string> {
    const input = await page.waitForSelector(selector);
    return await input!.evaluate((el, { attributeName }) => el.getAttribute(attributeName) ?? "", { attributeName });
}

export async function getTestIdAttribute(page: puppeteer.Page, testId: string, attributeName: string): Promise<string> {
    return await getElementAttribute(page, `[data-testid='${testId}']`, attributeName);
}

export async function getTestIdTextContent(page: puppeteer.Page, testId: string): Promise<string> {
    return await getElementTextContent(page, `[data-testid='${testId}']`);
}

export async function elementExists(page: puppeteer.Page, selector: string): Promise<boolean> {
    const exists = await page.$eval("body", body => body.querySelector(selector) !== null);
    return exists;
}

export async function createTestUser(page: puppeteer.Page): Promise<{ id: string, login: string, password: string }> {
    const user = {
        id: "",
        login: `test_${Date.now()}_${Math.random().toString(36).substr(2)}`,
        password: "test1234",
    };
    
    // Create user
    await loginAsRoot(page);
    await clickSidebarElement(page, "/users");
    await clickTestId(page, "UsersList__add");
    await typeTestIdDescendantInput(page, "UserCreate__login", user.login);
    const tmpPassword = await getTestIdText(page, "UserCreate__password");
    await clickTestId(page, "UserCreate__submit");
    await page.waitForSelector("[data-testid='UsersList__table']");
    user.id = await getElementAttribute(page, `[data-testid='UsersList__table'] [data-testid='UsersList__row__login'][data-user-login='${user.login}']`, "data-user-id");
    await logout(page);
    
    // Set password
    await login(page, user.login, tmpPassword);
    await typeTestIdDescendantInput(page, "UserSettings__ChangePassword__current-password", tmpPassword);
    await typeTestIdDescendantInput(page, "UserSettings__ChangePassword__new-password", user.password);
    await typeTestIdDescendantInput(page, "UserSettings__ChangePassword__new-password-repeated", user.password);
    await page.waitForSelector("[data-testid='UserSettings__ChangePassword__submit']:not([disabled])");
    await page.click("[data-testid='UserSettings__ChangePassword__submit']");
    await logout(page);
    
    return user;
}

export async function deleteTestUser(page: puppeteer.Page, userId: string): Promise<void> {
    await loginAsRoot(page);
    await clickSidebarElement(page, "/users");
    
    // Click delete and confirm
    const deleteButtonSelector = `[data-testid="UsersList__delete"][data-user-id="${userId}"]`;
    const button = (await page.waitForSelector(deleteButtonSelector))!;
    await button.click();
    await clickTestId(page, "UsersList__delete-dialog__yes");
    
    await logout(page);
}

export async function createTestWallet(page: puppeteer.Page): Promise<{ id: string, name: string, description: string }> {
    const wallet = {
        id: "",
        name: `test_${Date.now()}_${Math.random().toString(36).substr(2)}`,
        description: `testdescr ${Date.now()} ${Math.random().toString(36).substr(2)}`,
    };
    
    // Create wallet
    await clickSidebarElement(page, "/wallets");
    await clickTestId(page, "Wallets__add");
    await typeTestIdDescendantInput(page, "Wallets__add__name", wallet.name);
    await typeTestIdDescendantInput(page, "Wallets__add__description", wallet.description, { textarea: true });
    await clickTestId(page, "Wallets__add__save");
    wallet.id = await getElementAttribute(page, `[data-testid='Wallets__row__name'][data-wallet-name='${wallet.name}']`, "data-wallet-id");
    
    return wallet;
}

export async function deleteTestWallet(page: puppeteer.Page, walletId: string): Promise<void> {
    await clickSidebarElement(page, "/wallets");
    
    // Click delete and confirm
    const button = (await page.waitForSelector(`[data-testid="Wallets__delete"][data-wallet-id="${walletId}"]:not([disabled])`))!;
    await button.click();
    await clickTestId(page, "Wallets__delete-dialog__yes");
}

export async function createTestInvestmentType(page: puppeteer.Page): Promise<{ id: string, name: string, slug: string }> {
    const randomSuffix = `${Date.now()}${Math.random().toString(36).substr(2)}`;
    const investmentType = {
        id: "",
        name: `test lorem ipsum ${randomSuffix}`,
        slug: `testLoremIpsum${randomSuffix.replace(/ /g, "")}`,
    };
    
    // Create investment type
    await clickSidebarElement(page, "/investmentTypes");
    await clickTestId(page, "InvestmentTypes__add");
    await typeTestIdDescendantInput(page, "InvestmentTypes__add__name", investmentType.name);
    await clickTestId(page, "InvestmentTypes__add__save");
    investmentType.id = await getElementAttribute(page, `[data-testid='InvestmentTypes__row__name'][data-investment-type-name='${investmentType.name}']`, "data-investment-type-id");
    
    return investmentType;
}

export async function deleteTestInvestmentType(page: puppeteer.Page, investmentTypeId: string): Promise<void> {
    await clickSidebarElement(page, "/investmentTypes");
    
    // Click delete and confirm
    const button = (await page.waitForSelector(`[data-testid="InvestmentTypes__delete"][data-investment-type-id="${investmentTypeId}"]:not([disabled])`))!;
    await button.click();
    await clickTestId(page, "InvestmentTypes__delete-dialog__yes");
}


export async function createTestInvestment(page: puppeteer.Page, slug: string): Promise<{ id: string, name: string }> {
    const randomSuffix = `${Date.now()}${Math.random().toString(36).substr(2)}`;
    const investment = {
        id: "",
        name: `test lorem ipsum ${randomSuffix}`,
    };
    
    // Create investment
    await clickSidebarElement(page, `/investments/${slug}`);
    await clickTestId(page, "Investments__add");
    await typeTestIdDescendantInput(page, "Investments__add__name", investment.name);
    await clickTestId(page, "Investments__add__save");
    investment.id = await getElementAttribute(page, `[data-testid='Investments__row__name'][data-investment-name='${investment.name}']`, "data-investment-id");
    
    return investment;
}

export async function deleteTestInvestment(page: puppeteer.Page, investmentId: string, slug: string): Promise<void> {
    await clickSidebarElement(page, `/investments/${slug}`);
    
    // Click delete and confirm
    const button = (await page.waitForSelector(`[data-testid="Investments__delete"][data-investment-id="${investmentId}"]:not([disabled])`))!;
    await button.click();
    await clickTestId(page, "Investments__delete-dialog__yes");
}
