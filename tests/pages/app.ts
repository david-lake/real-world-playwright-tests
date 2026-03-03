import { Page } from '@playwright/test';
import { LoginPage } from '@pages/login.page';
import { RegisterPage } from '@pages/register.page';
import { SettingsPage } from '@pages/settings.page';
import { NavigationComponent } from '@components/navigation.component';

/**
 * App class combines all page objects and components.
 * Provides a unified interface for test interactions.
 */
export class App {
  readonly login: LoginPage;
  readonly register: RegisterPage;
  readonly settings: SettingsPage;
  readonly nav: NavigationComponent;

  constructor(readonly page: Page) {
    this.login = new LoginPage(page);
    this.register = new RegisterPage(page);
    this.settings = new SettingsPage(page);
    this.nav = new NavigationComponent(page);
  }
}