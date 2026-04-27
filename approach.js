const tabButtons = document.querySelectorAll(".tab-button");
const tabPanels = document.querySelectorAll(".tab-panel");
const layerCards = document.querySelectorAll(".layer-card");
const detailPanels = document.querySelectorAll(".detail-panel");

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const tab = button.dataset.tab;

    tabButtons.forEach((node) => node.classList.toggle("active", node === button));
    tabPanels.forEach((panel) => panel.classList.toggle("active", panel.id === `tab-${tab}`));
  });
});

layerCards.forEach((card) => {
  card.addEventListener("click", () => {
    const layer = card.dataset.layer;

    layerCards.forEach((node) => node.classList.toggle("selected", node === card));
    detailPanels.forEach((panel) => panel.classList.toggle("visible", panel.id === `detail-${layer}`));
  });
});
