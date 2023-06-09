import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Hero } from '../../interfaces/hero.interface';
import { HeroesService } from '../../services/heroes.service';

@Component({
  selector: 'app-search-page',
  templateUrl: './search-page.component.html',
  styles: [],
})
export class SearchPageComponent {
  public searchInput = new FormControl('');
  public heroes: Hero[] = [];
  public selectedHero: Hero | undefined;

  constructor(private heroService: HeroesService) {}

  searchHero() {
    const value: string = this.searchInput.value || '';
    console.log({ value });
    if (value.trim().length === 0) return;

    this.heroService
      .getSuggestions(value)
      .subscribe((heroes) => (this.heroes = heroes));
  }

  onSelectedOption(event: MatAutocompleteSelectedEvent): void {
    if (!event.option.value) {
      // this.heroes = [];
      this.selectedHero = undefined;
      return;
    }
    const hero: Hero = event.option.value;
    this.searchInput.setValue(hero.superhero);
    this.selectedHero = hero;
    // this.heroService.getHeroById(hero.id!).subscribe((hero) => {
    //   console.log({ hero });
    // });
  }
}
