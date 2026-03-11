import { Page } from '@playwright/test';
import { LoginPage } from '@pages/login.page';
import { RegisterPage } from '@pages/register.page';
import { SettingsPage } from '@pages/settings.page';
import { HomePage } from '@pages/home.page';
import { ProfilePage } from '@pages/profile.page';
import { EditorPage } from '@pages/editor.page';
import { ArticlePage } from '@pages/article.page';
import { Header } from '@components/header.component';
import { FeedComponent } from '@components/feed.component';

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
  readonly profile: ProfilePage;
  readonly editor: EditorPage;
  readonly article: ArticlePage;
  readonly header: Header;
  readonly feed: FeedComponent;

  constructor(page: Page) {
    this.page = page;
    this.login = new LoginPage(page);
    this.register = new RegisterPage(page);
    this.settings = new SettingsPage(page);
    this.home = new HomePage(page);
    this.profile = new ProfilePage(page);
    this.editor = new EditorPage(page);
    this.article = new ArticlePage(page);
    this.header = new Header(page);
    this.feed = new FeedComponent(page);
  }
}