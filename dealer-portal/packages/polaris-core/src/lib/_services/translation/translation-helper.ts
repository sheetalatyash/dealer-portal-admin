import { EnvironmentProviders, importProvidersFrom, ImportProvidersSource, Provider, inject, provideAppInitializer } from "@angular/core";
import { TranslateLoader, TranslateModule, TranslateService, TranslateStore } from "@ngx-translate/core";
import { CustomTranslateLoader, Translations } from "./custom-translate-loader";
import { ResourceService } from "../resource/resource.service";

/**
 * Loads translations during application initialization.
 * @param {TranslateService} translate - Instance of TranslateService.
 * @param {ResourceService} resourceService - Instance of ResourceService.
 * @returns {() => Promise<void>} A function that returns a promise resolving when the language is set.
 */
export function loadTranslations(translate: TranslateService, resourceService: ResourceService) {
  return () => new Promise<void>((resolve) => {
    const lang = resourceService.getCultureCode();
    translate.setDefaultLang(lang);
    translate.use(lang).subscribe({
      next: () => resolve(),
      error: () => resolve()
    });
  });
}

/**
 * Creates providers for translation services.
 * @param {Translations} translations - Custom translations to be used by CustomTranslateLoader.
 * @returns {(Provider | EnvironmentProviders)[]} An array of providers including TranslateLoader, APP_INITIALIZER, and TranslateStore.
 */
export function createTranslationProviders(translations: Translations): (Provider | EnvironmentProviders)[] {
  return [
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: () => new CustomTranslateLoader(translations),
        },
      })
    ),
    provideAppInitializer(() => {
        const initializerFn = (loadTranslations)(inject(TranslateService), inject(ResourceService));
        return initializerFn();
      }),
    TranslateStore
  ];
}