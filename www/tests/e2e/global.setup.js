import { test as setup } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { saveAuthenticatedStorageState, AUTH_STATE_PATH } from './helpers/auth.js';

setup('authenticate', async ({ page }) => {
  fs.mkdirSync(path.dirname(AUTH_STATE_PATH), { recursive: true });
  await saveAuthenticatedStorageState(page, AUTH_STATE_PATH);
});
