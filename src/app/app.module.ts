import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { TangramModule } from '@trademe/tangram/core';
import {
  TgTeleporterModule
} from '@trademe/tangram/directives/teleporter/teleporter.module';

import { AppComponent } from './app.component';

@NgModule({
  imports: [BrowserModule, HttpModule, TangramModule, TgTeleporterModule],
  declarations: [AppComponent],
  bootstrap: [AppComponent]
})
export class AppModule {}
