<script lang="ts">
	let { label = 'Open Modal', children, onopen, onapprove, class: className = '' } = $props();

	const id = crypto.randomUUID();

	function openModal() {
		onopen();
		let dialogElement: HTMLDialogElement = document.getElementById(id) as HTMLDialogElement;
		dialogElement.showModal();
	}
</script>

<!-- Open the modal using ID.showModal() method -->
<button class="btn btn-sm btn-accent" onclick={openModal}>{label}</button>
<dialog {id} class="modal">
	<div class={`modal-box ${className ?? 'w-11/12 max-w-5xl'}`}>
		{@render children()}

		<div class="modal-action">
			<form method="dialog" class="flex w-full justify-between">
				<!-- if there is a button in form, it will close the modal -->
				<button class="btn hover:btn-warning">Cancel</button>
				<button class="btn btn-primary" onclick={onapprove}>Finish</button>
			</form>
		</div>
	</div>
</dialog>
