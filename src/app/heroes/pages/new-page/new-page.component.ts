import { Component, OnInit } from '@angular/core';
import { Hero, Publisher } from '../../interfaces/hero.interface';
import { FormControl, FormGroup } from '@angular/forms';
import { HeroesService } from '../../services/heroes.service';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, switchMap, tap } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-new-page',
  templateUrl: './new-page.component.html',
  styles: [],
})
export class NewPageComponent implements OnInit {
  // formulario reactivo
  public heroForm = new FormGroup({
    id: new FormControl<string>(''),
    superhero: new FormControl<string>('', {
      nonNullable: true,
    }),
    publisher: new FormControl<Publisher>(Publisher.DCComics),
    alter_ego: new FormControl(''),
    first_appearance: new FormControl(''),
    characters: new FormControl(''),
    alt_img: new FormControl(''),
  });

  public publishers = [
    {
      id: 'DC Comics',
      desc: 'DC - Comics',
    },
    {
      id: 'Marvel Comics',
      desc: 'Marvel - Comics',
    },
  ];

  constructor(
    private heroesService: HeroesService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  get currentHero(): Hero {
    const hero = this.heroForm.value as Hero;
    return hero;
  }

  ngOnInit(): void {
    if (!this.router.url.includes('edit')) return;

    this.activatedRoute.params
      .pipe(switchMap(({ id }) => this.heroesService.getHeroById(id)))
      .subscribe((hero) => {
        if (!hero) return this.router.navigateByUrl('/');
        this.heroForm.reset(hero);
        return;
      });
  }

  onSubmit(): void {
    if (this.heroForm.invalid) return;

    if (this.currentHero.id) {
      // actualizar
      this.heroesService.updateHero(this.currentHero).subscribe((hero) => {
        this.showSnackBar(`Registro actualizado: ${hero.superhero}`);
      });

      return;
    }

    // crear
    this.heroesService.addHero(this.currentHero).subscribe((hero) => {
      this.router.navigate(['/heroes/edit', hero.id]);
      this.showSnackBar(`Registro creado: ${hero.superhero}`);
    });
  }

  onDeleteHero(): void {
    if (!this.currentHero.id) throw new Error('El id del Héroe es necesario');

    const dialog = this.dialog.open(ConfirmDialogComponent, {
      // width: '250px',
      data: this.heroForm.value,
    });

    dialog
      .afterClosed()
      .pipe(
        filter((result: boolean) => result),
        switchMap(() =>
          this.heroesService.deleteHeroById(this.currentHero.id!)
        ),
        filter((wasDeleted: boolean) => wasDeleted)
      )
      .subscribe(() => {
        this.router.navigate(['/heroes']);
      });

    // dialog.afterClosed().subscribe((result) => {
    //   if (!result) return;
    //   this.heroesService
    //     .deleteHeroById(this.currentHero.id!)
    //     .subscribe((wasDeleted) => {
    //       if (!wasDeleted) return;
    //       this.router.navigate(['/heroes']);
    //       this.showSnackBar(`Registro eliminado`);
    //     });
    // });
  }

  showSnackBar(message: string): void {
    this.snackBar.open(message, 'ok!', {
      duration: 2500,
    });
  }
}
