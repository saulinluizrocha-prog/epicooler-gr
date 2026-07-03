const Scroller = (() => {
	//#region private
	const targetAnchorSelector = ".rendered-form";
	//#endregion
	return {
		//#region public
		init: () => {
			document.addEventListener("click", (event) => {
				const link = event.target.closest("a[href]");
				if (!link) return;

				const href = link.getAttribute("href");

				if (href === "/") {
					event.preventDefault();
					document.querySelector(targetAnchorSelector)?.scrollIntoView({
						behavior: "smooth",
					});
				} else if (href.startsWith("#")) {
					event.preventDefault();
					const target = document.querySelector(href);
					if (target) {
						target.scrollIntoView({ behavior: "smooth" });
					}
				}
			});
		},
		//#endregion
	};
})();

window.addEventListener("DOMContentLoaded", () => {
	Scroller.init();
});
 