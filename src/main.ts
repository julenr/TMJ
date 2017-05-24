import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import './polyfills.browser';
import './rxjs.imports';


import { AppModule } from './app/app.module';

platformBrowserDynamic().bootstrapModule(AppModule);
