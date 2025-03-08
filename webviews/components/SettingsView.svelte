<script lang="ts">
  import { onMount } from "svelte";
    
  // Props
  export let navigateTo;
  
  // Settings state
  let settings = {
    modelSelection: "deepseek-coder",
  };
    
  // Available models
  let models: string[] = [];

  // Fetch available models from Ollama API
  function fetchModels() {
    tsvscode.postMessage({
      command: "getModels"
    });  
  }
    
  // Save settings
  function saveSettings(e: { preventDefault: () => void; }) {
    e.preventDefault();
      
    // Get the VS Code API
    // Send settings to extension
    tsvscode.postMessage({
      command: 'saveSettings',
      text: settings
    });
      
    // Show save indicator
    const saveIndicator = document.getElementById("save-indicator");
    if (saveIndicator) {
      saveIndicator.style.opacity = "1";
      setTimeout(() => {
        saveIndicator.style.opacity = "0";
      }, 2000);
    }
  }
    
  onMount(() => {

    // fetch models
    fetchModels();

    // Listen for settings from extension
    window.addEventListener('message', event => {
      const { command, settings: storedSettings } = event.data;
      if (command === 'loadSettings' && storedSettings) {
        settings = { ...settings, ...storedSettings };
      } else if (command === 'getModels') {
        const response = event.data;
        models = response.models;

      }
    });
  });
</script>
  
<header class="header">
  <button class="back-button" on:click={() => navigateTo("main")}>
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="19" y1="12" x2="5" y2="12"></line>
      <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
    <span>Back</span>
  </button>
  <h2>Settings</h2>
</header>
  
<section class="settings-section">
  <div class="card">
    <div class="card-content">
      <form class="settings-form" on:submit={saveSettings}>
        
        <div class="form-group">
          <label for="modelSelection">Model Selection</label>
          <select id="modelSelection" bind:value={settings.modelSelection}>
            {#each models as model}
              <option value={model}>{model}</option>
            {/each}
          </select>
        </div>
          
        <!-- <div class="form-group checkbox-group">
          <input 
            type="checkbox" 
            id="showThinking"
            bind:checked={settings.showThinking}
          >
          <label for="showThinking">Show thinking process</label>
        </div> -->
         
        <div class="button-row">
          <button type="submit" class="save-button">
            Save Settings
          </button>
          <span id="save-indicator" class="save-indicator">Settings saved!</span>
        </div>
      </form>
    </div>
  </div>
</section>
  
<style>
  .header {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--vscode-panel-border);
  }
    
  .header h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: var(--vscode-editor-foreground);
  }
    
  .back-button {
    display: flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
    margin-right: 16px;
  }
    
  .back-button:hover {
    background-color: var(--vscode-button-hoverBackground);
  }
    
  .settings-section {
    display: flex;
    flex-direction: column;
    gap: 16px;
    flex-grow: 1;
    overflow-y: auto;
  }
    
  .card {
    background-color: var(--vscode-editor-background);
    border: 1px solid var(--vscode-panel-border);
    border-radius: 6px;
    overflow: hidden;
  }
    
  .card-content {
    padding: 16px;
  }
    
  .settings-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
    
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
    
  /* .checkbox-group {
    flex-direction: row;
    align-items: center;
    gap: 8px;
  } */
    
  label {
    font-size: 14px;
    color: var(--vscode-foreground);
  }
  
  .button-row {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-top: 16px;
  }
    
  .save-button {
    background-color: var(--vscode-button-background);
    color: var(--vscode-button-foreground);
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
    align-self: flex-start;
  }
    
  .save-button:hover {
    background-color: var(--vscode-button-hoverBackground);
  }
    
  .save-indicator {
    color: var(--vscode-gitDecoration-addedResourceForeground);
    opacity: 0;
    transition: opacity 0.3s ease;
  }
</style>