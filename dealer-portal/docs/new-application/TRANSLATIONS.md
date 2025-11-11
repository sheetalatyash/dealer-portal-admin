# **Translations Guide**

## **Adding Translations to Your App**

### **1️⃣ Locate the Translations Directory**

Your translations are stored in:

```
/assets/translations/*
```

Every new application should include an **English translation file** (`en-us.json`) as a starting point.

💡 **Tip:** Group related translations logically to maintain organization.

#### Example Translation File *(en-us.json)*

```typescript
import { Translations } from '@dealer-portal/polaris-core';

export const translations: Translations = {
    "key": "value", // Top-level translations
    "section": {
        "nestedKey": "value" // Grouped/categorized translations
    }
};
```

---

### 2️⃣ Verify Translations Are Registered in `app.config.ts`

New applications include `createTranslationProviders(translations)` in the **list of providers**. This loads the **default English translations** from `assets/translations/en-us.json` at app creation.

#### Example: Configuring Translations in *app.config.ts*

```typescript
providers: [
    ...createTranslationProviders(translations),
    { provide: ENVIRONMENT_CONFIG, useValue: environment }
]
```

---

## **Using Translations in Your App**

This guide is based on [ngx-translate documentation](https://ngx-translate.org/getting-started/translating-your-components/).\
You have access to **three translation utilities**:

```typescript
import { TranslatePipe, TranslateDirective, TranslateService } from '@ngx-translate/core';
```

---

### **1️⃣ Using **`translatePipe`** in Templates**

Use `TranslatePipe` to translate text directly in your views.

#### **Import the Pipe**

```typescript
@Component({
  imports: [TranslatePipe]
})
```

#### **Example Translation File**

```typescript
export const translations: Translations = {
    "title": "COMMUNICATIONS",
    "table": {
        "search": "Search all communications",
        "no-results": "You have no new communications",
        "paging": {
            "displaying": "Displaying {{0}}-{{1}} of {{2}}",
            "load-more": "Load More"
        }
    }
};
```

#### **Usage in Templates**

```html
<div>{{ 'title' | translate }}</div>
```

---

### **2️⃣ Using the `translateDirective`**

Use the `TranslateDirective` when applying translations **directly to an element**.

#### **Import the Directive**

```typescript
@Component({
  imports: [TranslateDirective]
})
```

#### **Usage in Templates**

```html
<div translate="hello" [translateParams]="{ name: 'John' }"></div>
```

---

### **3️⃣ Using **`TranslateService.instant`** in Components**

Use `TranslateService` for translations inside TypeScript files.

#### **Inject the TranslateService**

```typescript
constructor(private _translate: TranslateService) {}
```

#### **Translate Instantly in TypeScript**

```typescript
this._translate.instant('notification.favorite.added');
```

🚨 **Important:** Avoid translating the same text multiple times.\
Applying both `instant` in TypeScript and `TranslatePipe` in templates **may cause errors**.

---

## **Best Practices & Notes**

✅ **Translate everything** — Even date formats like `'MM/dd/yy'` to ensure localization.\
✅ **Avoid duplicate translations** — Reuse keys unless different values might be needed later.\
✅ **Refer to the official ngx-translate docs** for advanced use cases: [ngx-translate.org](https://ngx-translate.org/)

---

🎉 **Happy Translating!** 🎉

