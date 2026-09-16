export const triggerConfetti = (element: HTMLElement) => {
  const colors = ["#ff8500", "#00c2ff", "#ef4444", "#FFD700", "#FF69B4"];
  const rect = element.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  for (let i = 0; i < 50; i++) {
    const confetti = document.createElement("div");
    confetti.className = "confetti";
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size = Math.random() * 8 + 4 + "px";
    const angle = Math.random() * 360;
    const velocity = Math.random() * 100 + 50;
    const duration = Math.random() * 1 + 0.5 + "s";

    Object.assign(confetti.style, {
      backgroundColor: color,
      width: size,
      height: size,
      left: centerX + "px",
      top: centerY + "px",
      position: "fixed",
      zIndex: "9999",
      borderRadius: Math.random() > 0.5 ? "50%" : "0",
      pointerEvents: "none",
    });

    const rad = angle * (Math.PI / 180);
    const tx = Math.cos(rad) * velocity;
    const ty = Math.sin(rad) * velocity;

    confetti.animate(
      [
        { transform: `translate(0, 0) rotate(0deg)`, opacity: 1 },
        {
          transform: `translate(${tx}px, ${ty}px) rotate(${Math.random() * 720}deg)`,
          opacity: 0,
        },
      ],
      {
        duration: parseFloat(duration) * 1000,
        easing: "cubic-bezier(0.25, 1, 0.5, 1)",
        fill: "forwards",
      },
    );

    document.body.appendChild(confetti);
    setTimeout(() => confetti.remove(), parseFloat(duration) * 1000);
  }
};
