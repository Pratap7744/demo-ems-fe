import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function noNumbersValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const hasNumber = /\d/.test(control.value);
    return hasNumber ? { hasNumber: true } : null;
  };
}

export function strongPasswordValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value: string = control.value;
    if (!value) return null;

    const errors: ValidationErrors = {};
    if (value.length < 8) errors['minLength'] = true;
    if (!/[A-Z]/.test(value)) errors['noUppercase'] = true;
    if (!/[a-z]/.test(value)) errors['noLowercase'] = true;
    if (!/\d/.test(value)) errors['noNumber'] = true;

    return Object.keys(errors).length ? errors : null;
  };
}