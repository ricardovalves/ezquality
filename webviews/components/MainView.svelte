<!-- <script lang="ts">
    import {onMount} from "svelte";
	function toggleCollapse() {
		const thinkingContent = document.getElementById("thinking-output");
		if(thinkingContent){
			if (thinkingContent.style.display === "none" || thinkingContent.style.display === "") {
				thinkingContent.style.display = "block";
			} else {
				thinkingContent.style.display = "none";
			}
		}
	}
</script>
<main>
    <h2>EZ Quality</h2>

	<div class="extension-container">
		<div class="output-section">
		  <div class="output-box">
			<div class="output-label">Answer</div>
			<div id="response" class="output-content"></div>
		  </div>
		</div>
	</div>

	<script>
		window.addEventListener('message', event => {
			const {command, text} = event.data;
			if (command == 'chatResponse') {
				document.getElementById('response').innerText = text;
			}
		});
	</script>
</main> -->

<script lang="ts">
	import { response } from "../../src/store/store";
	
	// Props
	export let navigateTo;	
	// Handle messages from VS Code extension
	window.addEventListener("message", (event) => {
    if (event.data.command === "chatResponseError") {
      console.error(event.data.text);
    } 
    else if (event.data.command === "chatResponseComplete") {
      console.log("Response fully received!");
      // Optional: Trigger an animation or enable UI elements
    }
  });
</script>
  <header class="header">
	<h2>EZ Quality</h2>
	<div class="header-actions">
	  <button class="icon-button" on:click={() => navigateTo('settings')} title="Settings">
		<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
		  <circle cx="12" cy="12" r="3"></circle>
		  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
		</svg>
	  </button>
	</div>
  </header>
  
  <section class="output-section">
	<div class="card">
	  <div class="card-header">
	  </div>
	  <div class="card-content">
		{#if $response}
		  <div class="response-content">
			{@html $response}
		  </div>
		{:else}
		  <div class="empty-state">
			<p>No response yet. Run a query to see results.</p>
		  </div>
		{/if}
	  </div>
	</div>
  </section>
  
  <style>
	.header {
	  display: flex;
	  align-items: center;
	  justify-content: space-between;
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
	
	.header-actions {
	  display: flex;
	  gap: 8px;
	}
	
	.icon-button {
	  background: none;
	  border: none;
	  color: var(--vscode-button-foreground);
	  cursor: pointer;
	  padding: 4px;
	  border-radius: 4px;
	  display: flex;
	  align-items: center;
	  justify-content: center;
	}
	
	.icon-button:hover {
	  background-color: var(--vscode-button-hoverBackground);
	}
	
	.output-section {
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
	
	.card-header {
	  padding: 8px 12px;
	  background-color: var(--vscode-sideBarSectionHeader-background);
	  display: flex;
	  justify-content: space-between;
	  align-items: center;
	  border-bottom: 1px solid var(--vscode-panel-border);
	}
	
	.card-content {
	  padding: 12px;
	  max-height: 600px;
	  overflow-y: auto;
	}
	
	
	.response-content {
	  white-space: pre-wrap;
	  line-height: 1.5;
	  font-size: 14px;
	}
	
	.empty-state {
	  text-align: center;
	  padding: 24px 0;
	  color: var(--vscode-descriptionForeground);
	}
  </style>