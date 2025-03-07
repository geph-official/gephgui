<script lang="ts">
  export let status: string;

  $: color =
    status === "connected"
      ? "bg-green-500"
      : status === "connecting"
        ? "bg-yellow-500"
        : "bg-red-500";
</script>

<div class={`inline-block w-4 h-4 rounded-full ${color} mr-2`}></div>
