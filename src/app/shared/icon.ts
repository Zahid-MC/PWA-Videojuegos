import { Component, computed, input } from '@angular/core';

const PATHS = {
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14Zm5 12 4.5 4.5',
  compass: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm3.5 5.5-2 5-5 2 2-5 5-2Z',
  shelf: 'M4 4v16M8 4v16M12 4v16M15.5 5l4 14.5M3 20.5h18',
  bell: 'M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15L6 16Zm4 4.5h4',
  bookmark: 'M6.5 4h11v16L12 16l-5.5 4V4Z',
  dice: 'M5 5h14v14H5V5Zm4 4h.01M15 9h.01M12 12h.01M9 15h.01M15 15h.01',
  pc: 'M3 5h18v11H3V5Zm6 15h6M12 16v4',
  browser: 'M3 5h18v14H3V5Zm0 4h18M6 7h.01M8.5 7h.01',
  back: 'M19 12H5m6-6-6 6 6 6',
  external: 'M14 4h6v6M20 4l-9 9M18 14v6H4V6h6',
  trash: 'M4 7h16M9 7V4h6v3M6.5 7l1 13h9l1-13',
  clock: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 4v5l3.5 2',
  offline:
    'M3 3l18 18M5 12.5a10 10 0 0 1 4-2.4M12 9.5c2.7 0 5.2 1.1 7 3M8.5 16a5 5 0 0 1 7 0M12 20h.01',
  install: 'M12 3v12m-5-5 5 5 5-5M4 20h16',
} as const;

export type IconName = keyof typeof PATHS;

@Component({
  selector: 'app-icon',
  template: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path [attr.d]="path()" />
    </svg>
  `,
  styles: `
    :host {
      display: inline-flex;
      flex: none;
    }
    svg {
      width: 1.25em;
      height: 1.25em;
      fill: none;
      stroke: currentColor;
      stroke-width: 1.9;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
  `,
})
export class Icon {
  readonly name = input.required<IconName>();
  protected readonly path = computed(() => PATHS[this.name()]);
}
