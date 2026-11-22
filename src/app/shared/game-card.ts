import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Game } from '../core/models/game.model';
import { LibraryService } from '../core/services/library.service';
import { GameBox } from './game-box';
import { Icon } from './icon';

@Component({
  selector: 'app-game-card',
  imports: [GameBox, Icon, RouterLink],
  template: `
    <article>
      <app-game-box [game]="game()" [eager]="eager()" />
      <div class="info">
        <div>
          <h3>
            <a [routerLink]="['/juego', game().id]">{{ game().title }}</a>
          </h3>
          <p>
            {{ game().releaseDate.slice(0, 4) }}
            @for (platform of game().platforms; track platform) {
              <app-icon [name]="platform" />
              <span class="sr-only">{{ platform === 'pc' ? 'PC' : 'Navegador' }}</span>
            }
          </p>
        </div>
        <button
          type="button"
          [class.saved]="saved()"
          [attr.aria-pressed]="saved()"
          [attr.aria-label]="
            (saved() ? 'Quitar de' : 'Guardar en') + ' mi biblioteca: ' + game().title
          "
          (click)="toggle()"
        >
          <app-icon name="bookmark" />
        </button>
      </div>
    </article>
  `,
  styles: `
    article {
      position: relative;
      display: grid;
      gap: 12px;
    }
    app-game-box {
      transition:
        transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1),
        box-shadow 0.25s;
      transform-origin: left center;
    }
    article:hover app-game-box,
    article:focus-within app-game-box {
      transform: perspective(900px) rotateY(-9deg) translateY(-4px);
      box-shadow: 16px 18px 30px -14px rgb(0 0 0 / 0.75);
    }
    .info {
      display: flex;
      justify-content: space-between;
      gap: 12px;
    }
    .info > div {
      min-width: 0;
    }
    h3 {
      font: 600 1rem/1.3 var(--body);
      letter-spacing: 0;
    }
    a {
      text-decoration: none;
    }
    a::after {
      content: '';
      position: absolute;
      inset: 0;
    }
    p {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--mute);
      font-size: 0.875rem;
    }
    button {
      position: relative;
      z-index: 1;
      display: grid;
      flex: none;
      place-items: center;
      width: 44px;
      height: 44px;
      border: 1px solid var(--line);
      border-radius: 12px;
      background: transparent;
      color: var(--mute);
    }
    button:hover {
      border-color: var(--mute);
      color: var(--cream);
    }
    button.saved {
      border-color: transparent;
      background: var(--coral);
      color: #1d0a04;
    }
  `,
})
export class GameCard {
  private readonly library = inject(LibraryService);

  readonly game = input.required<Game>();
  readonly eager = input(false);
  protected readonly saved = computed(() => !!this.library.get(this.game().id));

  protected toggle(): void {
    if (this.saved()) {
      this.library.remove(this.game().id);
    } else {
      this.library.setStatus(this.game(), 'wish');
    }
  }
}
