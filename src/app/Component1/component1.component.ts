import { Component } from '@angular/core';

import { SafeSvg } from '@trademe/tangram/components/svg/safe-svg';

import KEVIN_PEEK_BOTTOM_SVG from './kevin-peek-bottom.svg';

@Component({
  selector: 'component-one',
  templateUrl: './component1.component.html',
  styleUrls: ['./component1.component.scss']
})
export class Component1Component {
  public name = 'Jobs';
  public kevinPeekBottomSvg = new SafeSvg(
    KEVIN_PEEK_BOTTOM_SVG,
    'This is definitely a safe string of SVG that did not come from the user.'
  );
}
