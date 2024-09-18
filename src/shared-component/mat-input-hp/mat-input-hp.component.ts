import { Component, ElementRef, OnDestroy, booleanAttribute, computed, effect, inject, input, model, signal, untracked, viewChild } from '@angular/core';
import { AbstractControl, ControlValueAccessor, FormBuilder, FormControl, FormGroup, FormsModule, NgControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { FocusMonitor } from '@angular/cdk/a11y';
import { MAT_FORM_FIELD, MatFormFieldControl } from '@angular/material/form-field';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject } from 'rxjs';

/** Data structure for holding telephone number. */
class PhoneNumber {
  constructor(public area: string, public exchange: string, public subscriber: string) {}
}

@Component({
  selector: 'app-mat-input-hp',
  standalone: true,
  imports: [ FormsModule, ReactiveFormsModule ],
  providers: [{provide: MatFormFieldControl, useExisting: MatInputHpComponent}],
  template: `
    <div
      role="group"
      class="input-container"
      [formGroup]="parts"
      [attr.aria-labelledby]="_formField?.getLabelId()"
      (focusin)="onFocusIn()"
      (focusout)="onFocusOut($event)"
    >
      <input
        class="input-element"
        formControlName="area"
        size="3"
        maxLength="3"
        aria-label="Area code"
        (input)="_handleInput(parts.controls.area, exchange)"
        #area
      />
      <span class="input-spacer">&ndash;</span>
      <input
        class="input-element"
        formControlName="exchange"
        maxLength="4"
        size="4"
        aria-label="Exchange code"
        (input)="_handleInput(parts.controls.exchange, subscriber)"
        (keyup.backspace)="autoFocusPrev(parts.controls.exchange, area)"
        #exchange
      />
      <span class="input-spacer">&ndash;</span>
      <input
        class="input-element"
        formControlName="subscriber"
        maxLength="4"
        size="4"
        aria-label="Subscriber number"
        (input)="_handleInput(parts.controls.subscriber)"
        (keyup.backspace)="autoFocusPrev(parts.controls.subscriber, exchange)"
        #subscriber
      />
    </div>
  `,
  host: {
    '[class.floating]': 'shouldLabelFloat',
    '[id]': 'id',
  },
  styles: `
    .input-container {
      display: flex;
    }

    .input-element {
      border: none;
      background: none;
      padding: 0;
      outline: none;
      font: inherit;
      text-align: center;
      color: currentcolor;
    }

    .input-spacer {
      opacity: 0;
      transition: opacity 200ms;
    }

    :host.floating .input-spacer {
      opacity: 1;
    }
  `
})
export class MatInputHpComponent implements ControlValueAccessor, MatFormFieldControl<PhoneNumber>, OnDestroy {
  static nextId = 0;
  readonly areaInput = viewChild.required<HTMLInputElement>('area');
  readonly exchangeInput = viewChild.required<HTMLInputElement>('exchange');
  readonly subscriberInput = viewChild.required<HTMLInputElement>('subscriber');
  ngControl = inject(NgControl, {optional: true, self: true});
  readonly parts: FormGroup<{
    area: FormControl<string | null>;
    exchange: FormControl<string | null>;
    subscriber: FormControl<string | null>;
  }>;
  readonly stateChanges = new Subject<void>();
  readonly touched = signal(false);
  readonly controlType = 'tel-input';
  readonly id = `tel-input-${MatInputHpComponent.nextId++}`;
  readonly _userAriaDescribedBy = input<string>('', {alias: 'aria-describedby'});
  readonly _placeholder = input<string>('', {alias: 'placeholder'});
  readonly _required = input<boolean, unknown>(false, {
    alias: 'required',
    transform: booleanAttribute,
  });
  readonly _disabledByInput = input<boolean, unknown>(false, {
    alias: 'disabled',
    transform: booleanAttribute,
  });
  readonly _value = model<PhoneNumber | null>(null, {alias: 'value'});
  onChange = (_: any) => {};
  onTouched = () => {};

  protected readonly _formField = inject(MAT_FORM_FIELD, {
    optional: true,
  });

  private readonly _focused = signal(false);
  private readonly _disabledByCva = signal(false);
  private readonly _disabled = computed(() => this._disabledByInput() || this._disabledByCva());
  private readonly _focusMonitor = inject(FocusMonitor);
  private readonly _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  get focused(): boolean {
    return this._focused();
  }

  get empty() {
    const {
      value: {area, exchange, subscriber},
    } = this.parts;

    return !area && !exchange && !subscriber;
  }

  get shouldLabelFloat() {
    return this.focused || !this.empty;
  }

  get userAriaDescribedBy() {
    return this._userAriaDescribedBy();
  }

  get placeholder(): string {
    return this._placeholder();
  }

  get required(): boolean {
    return this._required();
  }

  get disabled(): boolean {
    return this._disabled();
  }

  get value(): PhoneNumber | null {
    return this._value();
  }

  get errorState(): boolean {
    return this.parts.invalid && this.touched();
  }
  constructor() {
    if (this.ngControl != null) {
      this.ngControl.valueAccessor = this;
    }

    this.parts = inject(FormBuilder).group({
      area: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(3)]],
      exchange: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(4)]],
      subscriber: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(4)]],
    });

    effect(() => {
      // Read signals to trigger effect.
      this._placeholder();
      this._required();
      this._disabled();
      // Propagate state changes.
      untracked(() => this.stateChanges.next());
    });

    effect(() => {
      if (this._disabled()) {
        untracked(() => this.parts.disable());
      } else {
        untracked(() => this.parts.enable());
      }
    });

    effect(() => {
      const value = this._value() || new PhoneNumber('', '', '');
      untracked(() => this.parts.setValue(value));
    });

    this.parts.statusChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      this.stateChanges.next();
    });

    this.parts.valueChanges.pipe(takeUntilDestroyed()).subscribe(value => {
      const tel = this.parts.valid
        ? new PhoneNumber(
            this.parts.value.area || '',
            this.parts.value.exchange || '',
            this.parts.value.subscriber || '',
          )
        : null;
      this._updateValue(tel);
    });
  }

  ngOnDestroy() {
    this.stateChanges.complete();
    this._focusMonitor.stopMonitoring(this._elementRef);
  }

  onFocusIn() {
    if (!this._focused()) {
      this._focused.set(true);
    }
  }

  onFocusOut(event: FocusEvent) {
    if (!this._elementRef.nativeElement.contains(event.relatedTarget as Element)) {
      this.touched.set(true);
      this._focused.set(false);
      this.onTouched();
    }
  }

  autoFocusNext(control: AbstractControl, nextElement?: HTMLInputElement): void {
    if (!control.errors && nextElement) {
      this._focusMonitor.focusVia(nextElement, 'program');
    }
  }

  autoFocusPrev(control: AbstractControl, prevElement: HTMLInputElement): void {
    if (control.value.length < 1) {
      this._focusMonitor.focusVia(prevElement, 'program');
    }
  }

  setDescribedByIds(ids: string[]) {
    const controlElement = this._elementRef.nativeElement.querySelector(
      '.input-container',
    )!;
    controlElement.setAttribute('aria-describedby', ids.join(' '));
  }

  onContainerClick() {
    if (this.parts.controls.subscriber.valid) {
      this._focusMonitor.focusVia(this.subscriberInput(), 'program');
    } else if (this.parts.controls.exchange.valid) {
      this._focusMonitor.focusVia(this.subscriberInput(), 'program');
    } else if (this.parts.controls.area.valid) {
      this._focusMonitor.focusVia(this.exchangeInput(), 'program');
    } else {
      this._focusMonitor.focusVia(this.areaInput(), 'program');
    }
  }

  writeValue(tel: PhoneNumber | null): void {
    this._updateValue(tel);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this._disabledByCva.set(isDisabled);
  }

  _handleInput(control: AbstractControl, nextElement?: HTMLInputElement): void {
    this.autoFocusNext(control, nextElement);
    this.onChange(this.value);
  }

  private _updateValue(tel: PhoneNumber | null) {
    const current = this._value();
    if ( tel === current ||  (tel?.area === current?.area && tel?.exchange === current?.exchange && tel?.subscriber === current?.subscriber) ) {
      return;
    }

    this._value.set(tel);
  }

}
