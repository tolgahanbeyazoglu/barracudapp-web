// Dynamic Year
document.getElementById("currentYear").textContent = new Date().getFullYear();

document.querySelectorAll("img.svg").forEach(function (img) {
  var imgID = img.id;
  var imgClass = img.className;
  var imgURL = img.src;

  fetch(imgURL)
    .then((response) => response.text())
    .then((data) => {
      var parser = new DOMParser();
      var xmlDoc = parser.parseFromString(data, "image/svg+xml");
      var svg = xmlDoc.querySelector("svg");

      if (imgID) {
        svg.setAttribute("id", imgID);
      }
      if (imgClass) {
        svg.setAttribute("class", imgClass + " replaced-svg");
      }

      svg.removeAttribute("xmlns:a");

      if (
        !svg.getAttribute("viewBox") &&
        svg.getAttribute("height") &&
        svg.getAttribute("width")
      ) {
        svg.setAttribute(
          "viewBox",
          "0 0 " + svg.getAttribute("height") + " " + svg.getAttribute("width")
        );
      }

      img.parentNode.replaceChild(svg, img);
    })
    .catch((error) => {
      console.error("Error fetching the SVG:", error);
    });
});

document.addEventListener("DOMContentLoaded", function () {
  // Services scroll system
  let currentServiceIndex = 0;
  const totalServices = 3;
  let isScrolling = false;
  let scrollTimeout;
  let isMenuClick = false; // Menu tıklaması flag'i
  let lastScrollTime = 0;
  const scrollDelay = 400; // Scroll hassasiyetini artırdık
  const serviceBoxes = document.querySelectorAll(".work-box");
  const serviceImages = document.querySelectorAll(".work-image");

  function updateServiceView(index) {
    // Update boxes
    serviceBoxes.forEach((box, i) => {
      const icon = box.querySelector("i");
      if (i === index) {
        box.classList.add("active");
      } else {
        box.classList.remove("active");
      }
    });

    // Update images
    serviceImages.forEach((img, i) => {
      if (i === index) {
        img.classList.add("active");
      } else {
        img.classList.remove("active");
      }
    });
  }

  // Service box click for manual control
  serviceBoxes.forEach((box) => {
    box.addEventListener("click", function () {
      currentServiceIndex = parseInt(this.getAttribute("data-service-index"));
      updateServiceView(currentServiceIndex);
    });
  });

  // FullPage.js - Temiz konfigürasyon
  if (document.getElementById("fullpage")) {
    new fullpage("#fullpage", {
      licenseKey: "gplv3-license",
      credits: { enabled: false },
      anchors: [
        "home",
        "about",
        "how-it-works",
        "faq",
        "subscribe",
        "download",
        "footer",
      ],
      menu: ".navbar-links",
      navigation: false,
      autoScrolling: true,
      scrollBar: false,
      fitToSection: true,
      scrollingSpeed: 700,
      paddingTop: "80px",
      responsiveWidth: 992,
      responsiveHeight: 0, // 992px-dən kiçik ekranlarda normal scroll
      afterRender: function () {
        // fullPage.js render olduktan sonra AOS'u başlat
        AOS.init({
          once: "true",
        });
      },
      afterLoad: function (origin, destination, direction) {
        // Her section yüklendiğinde AOS animasyonlarını manuel tetikle
        setTimeout(function () {
          const aosElements = destination.item.querySelectorAll("[data-aos]");
          aosElements.forEach(function (el) {
            el.classList.add("aos-animate");
          });
        }, 100);
      },
      onLeave: function (origin, destination, direction) {
        // Desktop navbar kontrolü
        const navbar = document.querySelector(".navbar-menu");
        if (destination.index > 0) {
          navbar.classList.add("fixed-menu");
        } else {
          navbar.classList.remove("fixed-menu");
        }

        // Menu tıklaması ise kontrolleri atla
        if (isMenuClick) {
          isMenuClick = false;
          currentServiceIndex = 0; // Index'i sıfırla
          return true; // Geçişe izin ver
        }

        // Hizmetler section'ından çıkarken kontrol (sadece scroll için)
        if (origin.anchor === "how-it-works" && !isMenuClick) {
          const currentTime = new Date().getTime();

          // Çok hızlı scroll hareketlerini engelle
          if (currentTime - lastScrollTime < scrollDelay) {
            return false;
          }

          if (direction === "down" && currentServiceIndex < totalServices - 1) {
            lastScrollTime = currentTime;
            isScrolling = true;
            currentServiceIndex++;
            updateServiceView(currentServiceIndex);
            setTimeout(() => {
              isScrolling = false;
            }, scrollDelay);
            return false; // Henüz tüm servisleri görmedi
          }
          if (direction === "up" && currentServiceIndex > 0) {
            lastScrollTime = currentTime;
            isScrolling = true;
            currentServiceIndex--;
            updateServiceView(currentServiceIndex);
            setTimeout(() => {
              isScrolling = false;
            }, scrollDelay);
            return false; // Henüz ilk servise gelmedi
          }
        }

        // Hizmetler section'ına girerken index'i sıfırla
        if (destination.anchor === "how-it-works") {
          if (direction === "down") {
            currentServiceIndex = 0;
          } else {
            currentServiceIndex = totalServices - 1;
          }
          updateServiceView(currentServiceIndex);
        }
      },
    });
  }

  // Mobile scroll pozisyonuna göre navbar fixed (sadece 992px altında)
  window.addEventListener("scroll", function () {
    if (window.innerWidth < 992) {
      const navbar = document.querySelector(".navbar-menu");
      if (window.scrollY > 150) {
        navbar.classList.add("fixed-menu");
      } else {
        navbar.classList.remove("fixed-menu");
      }
    }
  });

  // Mobile için AOS'u başlat (fullPage.js devre dışı olduğunda)
  if (window.innerWidth < 992) {
    AOS.init({
      duration: 800,
      easing: "ease",
      once: false,
      mirror: true,
      disable: false,
      offset: 120,
    });
  }

  // Navbar menu click event - mobilde smooth scroll, desktop'ta fullPage.js
  const navbarLinks = document.querySelectorAll(
    ".navbar-links a, .toggle-menu a"
  );
  navbarLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      isMenuClick = true;
      const href = this.getAttribute("href");

      // Eğer link başka bir sayfaya yönleniyorsa (index.html# içeriyorsa), normal davransın
      if (href.includes(".html")) {
        return; // Sayfaya yönlendir, preventDefault yapma
      }

      // Mobilde smooth scroll (aynı sayfa içinde)
      if (window.innerWidth < 992) {
        e.preventDefault();
        const targetId = href.substring(1);
        const targetSection = document.querySelector(
          `[data-anchor="${targetId}"]`
        );
        if (targetSection) {
          targetSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    });
  });

  // Mobile menu toggle
  const menuToggle = document.querySelector(".menu-tag-header");
  if (menuToggle) {
    menuToggle.addEventListener("click", function () {
      const toggle = document.querySelector(".toggle");
      const navbar = document.querySelector(".navbar-main");
      const htmlElement = document.documentElement;

      this.classList.toggle("active");
      htmlElement.classList.toggle("overflow");
      navbar.classList.toggle("active");
      toggle.classList.toggle("active");
    });
  }

  // Close mobile menu when clicking a link
  const mobileMenuLinks = document.querySelectorAll(".toggle-menu .links");
  mobileMenuLinks.forEach((link) => {
    link.addEventListener("click", function () {
      const toggle = document.querySelector(".toggle");
      const navbar = document.querySelector(".navbar-main");
      const menuTag = document.querySelector(".menu-tag-header");
      const htmlElement = document.documentElement;

      menuTag.classList.remove("active");
      htmlElement.classList.remove("overflow");
      navbar.classList.remove("active");
      toggle.classList.remove("active");
    });
  });
});
