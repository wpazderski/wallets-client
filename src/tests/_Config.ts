import * as puppeteer from "puppeteer";





const dev = process.env.TEST_ENV === "development";

export const Config = {
    dev: dev,
    baseUrl: "http://localhost:3000/",
    users: {
        root: { login: "testadmin", password: "admin123" },
    },
    browserLaunchOptions: <puppeteer.PuppeteerLaunchOptions>{
        headless: !dev,
        defaultViewport: { width: 1800, height: 900 },
    },
};
