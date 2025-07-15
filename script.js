document.addEventListener("DOMContentLoaded", function () {
  const backButton = document.getElementById("backButton");
  const library = document.getElementById("library");
  const main = document.querySelector("main");

  if (backButton) {
    backButton.addEventListener("click", function () {
      library.classList.add("hidden");
      main.classList.remove("hidden");
    });
  }

  // Giả lập nút mở thư viện
  document.getElementById("menu").addEventListener("click", function () {
    library.classList.remove("hidden");
    main.classList.add("hidden");
  });
});
