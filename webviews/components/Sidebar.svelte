<script lang="ts">
    import {onMount} from "svelte";
</script>
<main>
    <h2>EZ Quality</h2>
	<div id="response"></div>

	<script>
		window.addEventListener('message', event => {
			const {command, text} = event.data;
			if (command == 'chatResponse') {
				document.getElementById('response').innerText = text;
			}
		});
	</script>
</main>