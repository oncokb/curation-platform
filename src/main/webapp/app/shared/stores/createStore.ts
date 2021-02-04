import { LoadingBarStore } from 'app/shared/stores/loading-bar.store';
import { AuthStore } from 'app/shared/stores/authentication.store';
import { ApplicationProfileStore } from 'app/shared/stores/application-profile.store';
import { AdministrationStore } from 'app/modules/administration/administration.store';
import { UserStore } from 'app/modules/administration/user-management/user.store';
import { RegisterStore } from 'app/modules/account/register/register.store';
import { ActivateStore } from 'app/modules/account/activate/activate.store';
import { PasswordStore } from 'app/modules/account/password/password.store';
import { PasswordResetStore } from 'app/modules/account/password-reset/password-reset.store';
import { SettingsStore } from 'app/modules/account/settings/settings.store';
import { History } from 'history';
import { RouterStore } from './router.store';
/* jhipster-needle-add-store-import - JHipster will add store here */

export interface IRootStore {
  readonly loadingStore: LoadingBarStore;
  readonly authStore: AuthStore;
  readonly profileStore: ApplicationProfileStore;
  readonly adminStore: AdministrationStore;
  readonly userStore: UserStore;
  readonly registerStore: RegisterStore;
  readonly activateStore: ActivateStore;
  readonly passwordStore: PasswordStore;
  readonly passwordResetStore: PasswordResetStore;
  readonly settingsStore: SettingsStore;
  readonly routerStore: RouterStore;
  /* jhipster-needle-add-store-field - JHipster will add store here */
}

export function createStores(history: History): IRootStore {
  const rootStore = {} as any;

  rootStore.loadingStore = new LoadingBarStore();
  rootStore.authStore = new AuthStore(rootStore);
  rootStore.profileStore = new ApplicationProfileStore(rootStore);
  rootStore.adminStore = new AdministrationStore(rootStore);
  rootStore.userStore = new UserStore(rootStore);
  rootStore.registerStore = new RegisterStore(rootStore);
  rootStore.activateStore = new ActivateStore(rootStore);
  rootStore.passwordStore = new PasswordStore(rootStore);
  rootStore.passwordResetStore = new PasswordResetStore(rootStore);
  rootStore.settingsStore = new SettingsStore(rootStore);
  rootStore.routerStore = new RouterStore(history);
  /* jhipster-needle-add-store-init - JHipster will add store here */
  return rootStore;
}
