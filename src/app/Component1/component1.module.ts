import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  TgIconCircleQuestionModule
} from '@trademe/tangram/icons/circle-question.icon.module';
import {
  TgIconFunctionCrossModule
} from '@trademe/tangram/icons/function-cross.icon.module';
import { TgButtonsModule } from '@trademe/tangram/components/buttons';
import { TgSvgModule } from '@trademe/tangram/components/svg/svg.module';

import { Component1Component } from './component1.component';

@NgModule({
  imports: [
    CommonModule,
    TgIconCircleQuestionModule,
    TgIconFunctionCrossModule,
    TgButtonsModule,
    TgSvgModule
  ],
  declarations: [Component1Component],
  exports: [Component1Component]
})
export class Component1Module {}
