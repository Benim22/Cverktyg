/**
 * En enkel debounce-funktion som väntar en viss tid innan funktionen anropas
 * Detta är användbart för autosparning för att inte spara varje gång något ändras
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function (...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(later, wait);
  };
};

/**
 * En hook för autosparning av CV-data
 * @param saveFunction Funktionen som ska anropas för att spara data
 * @param delayMs Fördröjning i millisekunder innan sparning sker
 * @returns En funktion för att trigga autosparning och status för senaste sparningen
 */
export const createAutoSave = <T extends (...args: any[]) => Promise<any>>(
  saveFunction: T,
  delayMs: number = 2000
) => {
  // Vi använder debounce för att inte spara för ofta
  const debouncedSave = debounce(saveFunction, delayMs);
  
  // Status för senaste sparningen
  let lastSaveTime: Date | null = null;
  let isSaving = false;
  
  // Returnera funktioner och status
  return {
    // Anropa denna funktion varje gång något ändras för att trigga autospar
    autoSave: (...args: Parameters<T>) => {
      isSaving = true;
      debouncedSave(...args);
      setTimeout(() => {
        lastSaveTime = new Date();
        isSaving = false;
      }, delayMs + 100); // Lite extra tid för att säkerställa att sparningen är klar
    },
    
    // Hjälpfunktioner för att visa statusinformation
    getLastSaveTime: () => lastSaveTime,
    isAutoSaving: () => isSaving,
  };
}; 