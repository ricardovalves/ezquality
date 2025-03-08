import { writable } from 'svelte/store';

// Define types for our settings

declare const window: any;


export interface AppSettings {
    modelSelection: string;
}

// Create stores
export const currentView = writable<string>('main');
export const response = writable<string>('');

// Function to append to response incrementally
export function appendToResponse(text: string) {
    response.update((current) => current + text);
}
export const settings = writable<AppSettings>({
    modelSelection: 'deepseek-code:latest',
});

// Helper functions
export function navigateTo(view: string): void {
    currentView.set(view);
}

export function updateResponse(text: string): void {
    response.set(text);
}

export function updateSettings(newSettings: Partial<AppSettings>): void {
    settings.update(currentSettings => {
        return { ...currentSettings, ...newSettings };
  });
}

// Check if window is available before accessing it
if (typeof window !== 'undefined') {
    window.addEventListener('message', (event:any) => {
      const message = event.data;
      if (message.command === 'chatResponse') {
        appendToResponse(message.text);
      }
    });
  }