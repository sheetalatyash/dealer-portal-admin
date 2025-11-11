# 🚀 Creating a New Application with Our Automation Scripts

This guide explains how to use our automated scripts to generate a new Angular application inside our Nx monorepo. The process ensures that every new app follows a **consistent structure**, includes the necessary **configurations**, and is ready for development with minimal manual setup.

---

## **📌 How to Create a New Application**
1. Open a terminal in the root directory of the monorepo.
2. Run the following command:
   ```bash
   npm run generate:app
   ```
3. You will be **prompted** to enter:
  - **Application Name** (e.g., `user-administration`)
  - **Application Prefix** (e.g., `ua` for "User Administration")
4. The script will then automatically:
  - **Generate an Angular application** using Nx.
  - **Set up the project directory** and create required subdirectories.
  - **Copy and configure important files** (`tsconfig.json`, `project.json`, `.eslintrc.cjs`, etc.).
  - **Remove unnecessary generated files** (like `.eslintrc.json`).
  - **Set up environment files**.
  - **Remove `@ts-nocheck` from copied TypeScript files (`main.ts`, `app.config.ts`, and environment files`).**
5. **After the setup completes, you will be asked if you want to run the application immediately.**
  - Press **Enter** (default) or type **Y** to start the application.
  - Type **N** if you want to run it later manually.
6. Once the script completes, the new application is ready for development! 🎉

---

## **🔍 What’s Happening Behind the Scenes?**
The script performs several automated tasks to streamline the process. Below is a breakdown of each step.

### **1️⃣ Prompting for User Input**
- **Application Name:** The name of your new Angular application (e.g., `user-administration`).
- **Application Prefix:** A short, meaningful prefix for selectors and identifiers (e.g., `ua`).

### **2️⃣ Generating the Angular Application**
- Runs:
  ```bash
  npx nx g @nx/angular:app <APPLICATION-NAME> --directory=apps/<APPLICATION-NAME> --bundler=webpack --ssr=false --projectNameAndRootFormat=as-provided --prefix=<APPLICATION-PREFIX>
  ```
- **What this does:**
  - Generates a new Angular standalone application inside `apps/`.
  - Configures Webpack as the bundler.
  - Disables Server-Side Rendering (SSR).
  - Uses the user-defined prefix for component selectors.

### **3️⃣ Creating Required Directories**
- The script ensures the following directories exist:
  ```
  apps/<APPLICATION-NAME>/src/
  ├── _classes/
  ├── _components/
  ├── _directives/
  ├── _enums/
  ├── _guards/
  ├── _pipes/
  ├── _resolvers/
  ├── _services/
  ├── _types/
  ├── _environments/
  ├── assets/translations/
  ```

### **4️⃣ Adding Barrel Files (`index.ts`)**
- Each directory (except `_environments` and `assets`) gets an `index.ts` file to simplify imports.
- Example:
  ```typescript
  // apps/user-administration/src/_services/index.ts
  export * from './user.service';
  ```

### **5️⃣ Copying Configuration Files**
Several essential configuration files are copied and modified to match the new application:

| **File**              | **What It Does** |
|-----------------------|-----------------|
| `tsconfig.json`       | Configures TypeScript paths for the new app. `<APPLICATION-NAME>` is replaced dynamically. |
| `tsconfig.app.json`   | Defines build settings for the Angular app. |
| `.eslintrc.cjs`       | Lints the project according to predefined rules. `<APPLICATION-PREFIX>` is replaced dynamically. |
| `project.json`        | Configures build, serve, and test scripts in Nx. `<APPLICATION-NAME>` and `<APPLICATION-PREFIX>` are replaced dynamically. |
| `main.ts`             | Bootstraps the Angular application (**`@ts-nocheck` is removed**). |
| `app.config.ts`       | Stores application-wide configuration settings (**`@ts-nocheck` is removed**). |

### **6️⃣ Setting Up Environment Files**
- The script copies default **environment files** (`environment.ts`, `environment.local.ts`, `environment.staging.ts`, `environment.development.ts`, `environment.prod.ts`) from:
  ```
  docs/new-application/_environments/
  ```
- These files are placed into:
  ```
  apps/<APPLICATION-NAME>/src/_environments/
  ```
- **Before copying, any `@ts-nocheck` line is removed.**
- **Any instance of `<APPLICATION-NAME>` inside the environment files is replaced with the actual project name.**

### **7️⃣ Creating a Default Translation File**
- A default English translation file (`en-us.json`) is added:
  ```
  apps/<APPLICATION-NAME>/src/assets/translations/en-us.json
  ```
- Example contents:
  ```json
  {
    "welcome": "Welcome to the app!",
    "language": "English",
    "version": "1.0.0"
  }
  ```

### **8️⃣ Running the Application (Optional)**
- After the application is created, you will be asked:
  ```
  Do you want to run the app now? (Y/n)
  ```
  - Press **Enter** (default) or type **Y** to start the application immediately.
  - Type **N** if you want to run it later manually.

---

## **🎯 Next Steps After Generation**
Once the script completes:
1. **Verify that the new app was created:**
   ```bash
   ls apps/<APPLICATION-NAME>
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Run the application manually (if you chose not to run it automatically):**
   ```bash
   npx nx run <APPLICATION-NAME>:serve:prod
   ```
4. **Start coding!** 🚀

---

## **❓ FAQs**
### **1️⃣ Can I skip entering an application prefix?**
- Yes! If you press **Enter** without entering a prefix, the app name will be used by default.

### **2️⃣ What if I need multiple environment files?**
- You can manually add additional environment files in `src/_environments/`.

### **3️⃣ Can I modify the default translation file?**
- Yes! You can add more translation keys or additional language files in `src/assets/translations/`.

### **4️⃣ What if I already have an application with the same name?**
- The script will fail if the directory already exists. Choose a different application name.

---

## **🛠️ Troubleshooting**
| **Issue** | **Possible Fix** |
|-----------|-----------------|
| Error: "Application name cannot be empty." | Make sure you enter a valid name. |
| Error: "Source file not found." | Check if all required files exist in `docs/new-application/`. |
| App doesn't start correctly | Run `npm install` before serving the app. |

---

## **🎉 Summary**
This script makes it **fast** and **consistent** to create a new Angular app inside our Nx monorepo. It **automates setup, ensures best practices**, and **saves time**. 🚀

---
