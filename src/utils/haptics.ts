export function vibrateCorrect(): void {
  if (navigator.vibrate) {
    navigator.vibrate(50)
  }
}

export function vibrateWrong(): void {
  if (navigator.vibrate) {
    navigator.vibrate([30, 50, 30])
  }
}
