import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, Validators, NonNullableFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { AuthService } from '../../../core/auth/auth';
import { Icon } from '../../../shared/components/icon/icon.component';
import { TELEPHONE_PATTERN } from '../../../shared/utils/validators';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class Login {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly loading = signal(false);
  readonly submitted = signal(false);
  readonly showPassword = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.group({
    telephone: this.fb.control('', [Validators.required, Validators.pattern(TELEPHONE_PATTERN)]),
    motDePasse: this.fb.control('', [Validators.required]),
  });

  async onSubmit(): Promise<void> {
    this.submitted.set(true);
    this.errorMessage.set(null);

    if (this.form.invalid) {
      return;
    }

    this.loading.set(true);
    try {
      await firstValueFrom(this.auth.login(this.form.getRawValue()));
      await this.auth.chargerProfilApresLogin();
      const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? this.auth.urlAtterrissage();
      await this.router.navigateByUrl(returnUrl);
    } catch {
      this.errorMessage.set('Téléphone ou mot de passe incorrect.');
    } finally {
      this.loading.set(false);
    }
  }
}
