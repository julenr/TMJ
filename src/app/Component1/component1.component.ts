import { Component } from '@angular/core';

import { SafeSvg } from '@trademe/tangram/components/svg/safe-svg';

const KEVIN_PEEK_BOTTOM_SVG = require('./kevin-peek-bottom.svg');

@Component({
  selector: 'component-one',
  templateUrl: './component1.component.html',
  styleUrls: ['./component1.component.scss']
})
export class Component1 {
  name = 'Jobs';
  kevinPeekBottomSvg = new SafeSvg(
    KEVIN_PEEK_BOTTOM_SVG,
    'This is definitely a safe string of SVG that did not come from the user.'
  );
}
