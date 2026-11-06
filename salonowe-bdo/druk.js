document.querySelectorAll("[data-print]").forEach(function (a) { a.addEventListener("click", function (e) { e.preventDefault(); window.print(); }); });
