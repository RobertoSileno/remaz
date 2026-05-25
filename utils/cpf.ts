export function cpfDigits(value: string) {
  return value.replace(/\D/g, '').slice(0, 11);
}

export function formatCpf(value: string) {
  const digits = cpfDigits(value);

  if (digits.length <= 3) {
    return digits;
  }
  if (digits.length <= 6) {
    return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  }
  if (digits.length <= 9) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  }
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

export function isValidCpf(value: string) {
  const digits = cpfDigits(value);
  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) {
    return false;
  }

  for (const length of [9, 10]) {
    const total = digits
      .slice(0, length)
      .split('')
      .reduce((sum, digit, index) => sum + Number(digit) * (length + 1 - index), 0);
    const verifier = ((total * 10) % 11) % 10;
    if (verifier !== Number(digits[length])) {
      return false;
    }
  }

  return true;
}
