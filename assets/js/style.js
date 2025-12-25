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
  let isMenuClick = false; // Menu tıklaması flag'i


    const commentSwiper = new Swiper(".comment-swiper", {
    loop: true,
    slidesPerView: 3,
    spaceBetween: 36,
    autoplay: {
      delay: 3000,
      disableOnInteraction: false,
    },
    pagination: {
      el: ".comment-pagination",
      clickable: true,
    },
    breakpoints: {
      0: { slidesPerView: 1 },
      768: { slidesPerView: 2 },
      1024: { slidesPerView: 2 },
       1200: { slidesPerView: 3 },
    },
  });
  // Work Section Swiper Initialization
  let workSwiper = null;
  if (document.querySelector(".work-images-swiper")) {
    const workBoxes = document.querySelectorAll(".works-slides-pag");
    
    workSwiper = new Swiper(".work-images-swiper", {
      effect: "fade",
      fadeEffect: {
        crossFade: true,
      },
      speed: 600,
      allowTouchMove: false,
      loop: true,
      autoplay: {
        delay: 2000,
        disableOnInteraction: false,
      },
      on: {
        init: function () {
          // İlk yüklemede autoplay'i başlat
          this.autoplay.start();
        },
        slideChange: function () {
          // Update work boxes based on swiper slide change
          const realIndex = this.realIndex;
          workBoxes.forEach((box, index) => {
            if (index === realIndex) {
              box.classList.add("active");
            } else {
              box.classList.remove("active");
            }
          });
        },
      },
    });

    // Work box click to change slide
    workBoxes.forEach((box, index) => {
      box.addEventListener("click", function () {
        workSwiper.slideToLoop(index);
      });
    });
  }

  // FullPage.js - Temiz konfigürasyon
  if (document.getElementById("fullpage")) {
    new fullpage("#fullpage", {
      licenseKey: "gplv3-license",
      credits: { enabled: false },
      anchors: [
        "home",
        "about",
        "features",
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

        // how-it-works section'ına geldiğinde workSwiper'ı başa al ve autoplay'i başlat
        if (destination.anchor === "how-it-works" && workSwiper) {
          workSwiper.slideTo(0, 0);
          workSwiper.autoplay.start();
        }
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
          return true; // Geçişe izin ver
        }

        // Reset work swiper when leaving how-it-works section
        if (origin.anchor === "how-it-works" && workSwiper) {
          workSwiper.autoplay.stop();
          workSwiper.slideTo(0, 0);
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
