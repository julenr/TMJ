import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import 'core-js/client/shim';
import 'zone.js';

import { AppModule } from './app/app.module';

platformBrowserDynamic().bootstrapModule(AppModule);
