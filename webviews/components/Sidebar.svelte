<script lang="ts">
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
</main>