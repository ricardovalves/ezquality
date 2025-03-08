<script lang="ts">
    import { onMount } from "svelte";
    import { writable } from "svelte/store";
    import MainView from "./MainView.svelte";
    import SettingsView from "./SettingsView.svelte";
    
    // Store for the current view
    export const currentView = writable("main");
    
    // Store for the chat response
    export const response = writable("");
    
    // Navigate between views
    export function navigateTo(view:string) {
      currentView.set(view);
    }
    $: console.log($currentView);
    $: console.log($response);
    onMount(() => {
      // Listen for messages from the extension
      window.addEventListener('message', event => {
        const { command, text } = event.data;
        if (command === 'chatResponse') {
          response.set(text);
        }
      });
      
      // Apply VS Code styles
      document.body.classList.add('vscode-light');
      
      // Get the current theme from VS Code
      // Cleanup
      return () => {
        window.removeEventListener('message', () => {});
      };
    });
  </script>
  
  <main class="container">
    {#if $currentView === "main"}
      <MainView {navigateTo} />
    {:else if $currentView === "settings"}
      <SettingsView {navigateTo} />
    {/if}
  </main>
  
  <style>
    :global(body) {
      margin: 0;
      padding: 0;
      font-family: var(--vscode-font-family);
      color: var(--vscode-foreground);
      background-color: var(--vscode-editor-background);
    }
    
    .container {
      padding: 16px;
      height: 100%;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
    }
  </style>