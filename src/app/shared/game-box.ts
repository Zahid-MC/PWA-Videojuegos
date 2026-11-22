import { Component, computed, input, linkedSignal } from '@angular/core';
import { Game } from '../core/models/game.model';
import { genreColor, genreLabel } from '../core/utils/genres';

/** Caja de juego: lomo con el color del género y portada, con respaldo si la imagen no está. */
@Component({
  selector: 'app-game-box',
  template: `
    <span class="spine">
      <span>{{ label() }}</span>
    </span>
    <span class="cover">
      @if (failed()) {
        <span class="fallback">{{ game().title }}</span>
      } @else {
        <img
          [src]="game().image"
          alt=""
          width="365"
          height="206"
          [attr.loading]="eager() ? 'eager' : 'lazy'"
          (error)="failed.set(true)"
        />
      }
    </span>
  `,
  styles: `
    :host {
      display: grid;
      grid-template-columns: 30px 1fr;
      overflow: hidden;
      border-radius: 8px 12px 12px 8px;
      background: var(--panel-high);
      aspect-ratio: 395 / 206;
    }
    .spine {
      position: relative;
      display: grid;
      place-items: center;
      background: var(--genre);
      box-shadow: inset -6px 0 8px -6px rgb(0 0 0 / 0.45);
    }
    .spine span {
      position: absolute;
      color: #10181a;
      font: 600 0.72rem/1 var(--body);
      white-space: nowrap;
      transform: rotate(-90deg);
    }
    .cover {
      min-width: 0;
      overflow: hidden;
    }
    img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .fallback {
      display: grid;
      place-items: center;
      height: 100%;
      padding: 12px;
      background:
        radial-gradient(circle at 1px 1px, rgb(255 255 255 / 0.12) 1px, transparent 0) 0 0 / 12px
          12px,
        color-mix(in oklab, var(--genre) 26%, var(--ink));
      font: 700 0.95rem/1.2 var(--display);
      text-align: center;
      overflow-wrap: anywhere;
    }
  `,
  host: { '[style.--genre]': 'color()' },
})
export class GameBox {
  readonly game = input.required<Game>();
  readonly eager = input(false);

  protected readonly failed = linkedSignal({ source: this.game, computation: () => false });
  protected readonly label = computed(() => genreLabel(this.game().genre));
  protected readonly color = computed(() => genreColor(this.game().genre));
}
