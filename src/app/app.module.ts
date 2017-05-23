import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { TmApiModule } from '@trademe/api';
import { TangramModule } from '@trademe/tangram/core';
import {
  TgTeleporterModule
} from '@trademe/tangram/directives/teleporter/teleporter.module';

import { TgButtonsModule } from '@trademe/tangram/components/buttons';

import { MainComponent } from './Main/main.component';

import { Component1Module } from './Component1/component1.module';

@NgModule({
  imports: [
    BrowserModule,
    HttpModule,
    TmApiModule.forRoot(),
    TangramModule.forRoot(),
    TgTeleporterModule,
    TgButtonsModule,
    Component1Module
  ],
  declarations: [MainComponent],
  bootstrap: [MainComponent]
})
export class AppModule {}
