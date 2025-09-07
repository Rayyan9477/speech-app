import { Page } from 'puppeteer';
import { URLS, getFullUrl } from '../config/urls';

export abstract class BasePage {
  protected page: Page;
  protected url: string;

  constructor(page: Page, path: string = '') {
    this.page = page;
    this.url = getFullUrl('frontend', path);
  }

  // Navigation methods
  async goto(options?: { waitUntil?: 'load' | 'domcontentloaded' | 'networkidle0' | 'networkidle2' }): Promise<void> {
    await this.page.goto(this.url, { 
      waitUntil: options?.waitUntil || 'networkidle0',
      timeout: 30000
    });
  }

  async reload(): Promise<void> {
    await this.page.reload({ waitUntil: 'networkidle0' });
  }

  // Element interaction methods
  async waitForSelector(selector: string, timeout: number = 10000): Promise<void> {
    await this.page.waitForSelector(selector, { timeout });
  }

  async click(selector: string): Promise<void> {
    await this.waitForSelector(selector);
    await this.page.click(selector);
  }

  async type(selector: string, text: string, options?: { delay?: number }): Promise<void> {
    await this.waitForSelector(selector);
    await this.page.focus(selector);
    await this.clearInput(selector);
    await this.page.type(selector, text, options);
  }

  async clearInput(selector: string): Promise<void> {
    await this.page.focus(selector);
    await this.page.keyboard.down('Control');
    await this.page.keyboard.press('KeyA');
    await this.page.keyboard.up('Control');
    await this.page.keyboard.press('Delete');
  }

  async getText(selector: string): Promise<string> {
    await this.waitForSelector(selector);
    return await this.page.$eval(selector, el => el.textContent?.trim() || '');
  }

  async getValue(selector: string): Promise<string> {
    await this.waitForSelector(selector);
    return await this.page.$eval(selector, el => (el as HTMLInputElement).value || '');
  }

  async isVisible(selector: string): Promise<boolean> {
    try {
      await this.page.waitForSelector(selector, { timeout: 5000 });
      return await this.page.$eval(selector, el => {
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
      });
    } catch {
      return false;
    }
  }

  async isEnabled(selector: string): Promise<boolean> {
    await this.waitForSelector(selector);
    return await this.page.$eval(selector, el => !(el as HTMLInputElement).disabled);
  }

  async getAttribute(selector: string, attribute: string): Promise<string | null> {
    await this.waitForSelector(selector);
    return await this.page.$eval(selector, (el, attr) => el.getAttribute(attr), attribute);
  }

  // Form interaction methods
  async selectOption(selector: string, value: string): Promise<void> {
    await this.waitForSelector(selector);
    await this.page.select(selector, value);
  }

  async uploadFile(selector: string, filePath: string): Promise<void> {
    await this.waitForSelector(selector);
    const input = await this.page.$(selector);
    if (input) {
      await input.uploadFile(filePath);
    }
  }

  async checkCheckbox(selector: string, check: boolean = true): Promise<void> {
    await this.waitForSelector(selector);
    const isChecked = await this.page.$eval(selector, el => (el as HTMLInputElement).checked);
    
    if (isChecked !== check) {
      await this.page.click(selector);
    }
  }

  // Wait methods
  async waitForText(text: string, timeout: number = 10000): Promise<void> {
    await this.page.waitForFunction(
      (searchText) => document.body.innerText.includes(searchText),
      { timeout },
      text
    );
  }

  async waitForUrl(expectedUrl: string, timeout: number = 10000): Promise<void> {
    await this.page.waitForFunction(
      (url) => window.location.href.includes(url),
      { timeout },
      expectedUrl
    );
  }

  async waitForElement(selector: string, state: 'visible' | 'hidden' = 'visible', timeout: number = 10000): Promise<void> {
    if (state === 'visible') {
      await this.page.waitForSelector(selector, { visible: true, timeout });
    } else {
      await this.page.waitForSelector(selector, { hidden: true, timeout });
    }
  }

  async waitForNetworkIdle(timeout: number = 5000): Promise<void> {
    await this.page.waitForLoadState?.('networkidle') || 
          await this.page.waitForTimeout(timeout);
  }

  // Utility methods
  async getCurrentUrl(): Promise<string> {
    return await this.page.url();
  }

  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  async scrollToElement(selector: string): Promise<void> {
    await this.waitForSelector(selector);
    await this.page.evaluate((sel) => {
      const element = document.querySelector(sel);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, selector);
    await this.page.waitForTimeout(500);
  }

  async scrollToTop(): Promise<void> {
    await this.page.evaluate(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    await this.page.waitForTimeout(500);
  }

  async scrollToBottom(): Promise<void> {
    await this.page.evaluate(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    });
    await this.page.waitForTimeout(500);
  }

  // Screenshot methods
  async takeScreenshot(name: string): Promise<string> {
    const path = `screenshots/${name}-${Date.now()}.png`;
    await this.page.screenshot({ 
      path, 
      fullPage: true,
      type: 'png'
    });
    return path;
  }

  async takeElementScreenshot(selector: string, name: string): Promise<string> {
    await this.waitForSelector(selector);
    const element = await this.page.$(selector);
    const path = `screenshots/${name}-element-${Date.now()}.png`;
    
    if (element) {
      await element.screenshot({ path, type: 'png' });
    }
    
    return path;
  }

  // Error handling
  async getConsoleErrors(): Promise<string[]> {
    return await this.page.evaluate(() => {
      // @ts-ignore
      return window.__consoleErrors__ || [];
    });
  }

  async getNetworkErrors(): Promise<any[]> {
    return await this.page.evaluate(() => {
      // @ts-ignore
      return window.__networkErrors__ || [];
    });
  }

  // Abstract method that subclasses should implement
  abstract isLoaded(): Promise<boolean>;
}