<div class="spinner" />

<style>
    .spinner::before {
        animation: 1.5s linear infinite spinner;
        animation-play-state: inherit;
        border: solid .25rem #cfd0d1;
        border-bottom-color: #1c87c9;
        border-radius: 50%;
        content: "";
        height: 1.5rem;
        width: 1.5rem;
        position: absolute;
        top: 50%;
        right: 10%;
        transform: translate3d(-50%, -50%, 0);
        will-change: transform;
    }

    @keyframes spinner {
        0% {
            transform: translate3d(-50%, -50%, 0) rotate(0deg);
        }
        100% {
                transform: translate3d(-50%, -50%, 0) rotate(360deg);
        }
    }
</style>