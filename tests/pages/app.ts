import { Page } from '@playwright/test';
import { LoginPage } from '@pages/login.page';
import { RegisterPage } from '@pages/register.page';
import { SettingsPage } from '@pages/settings.page';
import { HomePage } from '@pages/home.page';
import { Header } from '@components/header.component';

/**
 * App class combines all page objects and components.
 * Provides a unified interface for test interactions.
 */
export class App {
  readonly page: Page;
  readonly login: LoginPage;
  readonly register: RegisterPage;
  readonly settings: SettingsPage;
  readonly home: HomePage;
  readonly header: Header;

  constructor(readonly page: Page) {
    this.page = page;
    this.login = new LoginPage(page);
    this.register = new RegisterPage(page);
    this.settings = new SettingsPage(page);
    this.home = new HomePage(page);
    this.header = new Header(page);
  }
}