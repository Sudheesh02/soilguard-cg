// SoilGuard-CG Institutional Ground-Station Console Script with Leaflet GIS Map

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Leaflet Map (Locked strictly to Raipur AOI)
  const raipurCenter = [21.20, 81.70];
  const raipurBounds = [
    [21.10, 81.60], // South-West (Lat, Lon)
    [21.30, 81.80]  // North-East (Lat, Lon)
  ];
  const maxBounds = [
    [21.00, 81.50],
    [21.40, 81.90]
  ];

  const mapContainer = document.getElementById('leaflet-map');
  let map = null;

  if (mapContainer && typeof L !== 'undefined') {
    map = L.map('leaflet-map', {
      center: raipurCenter,
      zoom: 11,
      minZoom: 10,
      maxZoom: 14,
      maxBounds: maxBounds,
      maxBoundsViscosity: 0.9,
      zoomControl: true,
      attributionControl: false
    });

    // Dark-themed basemap tile layer (CartoDB Dark Matter / Esri Dark)
    const basemap = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 18,
      subdomains: 'abcd'
    }).addTo(map);

    // Bounding Box Rectangle (Cyan Dashed)
    const aoiRect = L.rectangle(raipurBounds, {
      color: '#06b6d4',
      weight: 2,
      dashArray: '6, 6',
      fillColor: '#06b6d4',
      fillOpacity: 0.04
    }).addTo(map);
    aoiRect.bindTooltip("Raipur AOI (22km x 22km | EPSG:32644)", { permanent: false, direction: 'center' });

    // Map Layer Overlays (Geospatial PNGs mapped onto Raipur AOI)
    const layers = {
      risk: L.imageOverlay('assets/images/risk_score_map.png', raipurBounds, { opacity: 0.85 }),
      zonal: L.imageOverlay('assets/images/zonal_risk_map.png', raipurBounds, { opacity: 0.85 }),
      bsi: L.imageOverlay('assets/images/bsi_map.png', raipurBounds, { opacity: 0.85 }),
      falsecolor: L.imageOverlay('assets/images/false_color_composite.png', raipurBounds, { opacity: 0.85 })
    };

    // Default Layer Active: Soil Health Risk Map
    layers.risk.addTo(map);

    // Layer Control Buttons
    const layerButtons = document.querySelectorAll('.gis-layer-btn');
    layerButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const selectedLayerKey = btn.getAttribute('data-layer');

        layerButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Remove all overlays
        Object.values(layers).forEach(l => map.removeLayer(l));

        // Add selected overlay
        if (layers[selectedLayerKey]) {
          layers[selectedLayerKey].addTo(map);
        }
      });
    });

    // Dynamic Lat/Long Telemetry Bar on Mouse Move over Leaflet Map
    const telemetryBar = document.getElementById('mapTelemetryReadout');
    map.on('mousemove', (e) => {
      const lat = e.latlng.lat.toFixed(4);
      const lng = e.latlng.lng.toFixed(4);

      if (telemetryBar) {
        telemetryBar.innerHTML = `LAT: <span class="text-cyan-400 font-mono">${lat}° N</span> | LON: <span class="text-cyan-400 font-mono">${lng}° E</span> | PROJ: <span class="text-emerald-400 font-mono">EPSG:32644</span>`;
      }
    });
  }

  // 2. Navigation View Switcher / Tabs + Mobile Hamburger
  const navTabs = document.querySelectorAll('.nav-tab-link');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');

  // Hamburger toggle
  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      mobileMenuBtn.classList.toggle('open', isOpen);
      mobileMenuBtn.setAttribute('aria-expanded', String(isOpen));
      mobileMenu.setAttribute('aria-hidden', String(!isOpen));
    });
  }

  // Close mobile menu when a link is clicked
  navTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      const targetHash = tab.getAttribute('href');
      const targetSec = document.querySelector(targetHash);

      // Mark active in both desktop and mobile nav
      navTabs.forEach(t => t.classList.remove('active'));
      document.querySelectorAll(`.nav-tab-link[href="${targetHash}"]`).forEach(t => t.classList.add('active'));

      // Close mobile menu
      if (mobileMenu && mobileMenuBtn) {
        mobileMenu.classList.remove('open');
        mobileMenuBtn.classList.remove('open');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('aria-hidden', 'true');
      }

      if (targetSec) {
        targetSec.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Scroll-spy: update active nav tab based on which section is in view
  const spySections = document.querySelectorAll('section[id]');
  const scrollSpyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        document.querySelectorAll('.nav-tab-link').forEach(t => {
          t.classList.toggle('active', t.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, {
    rootMargin: '-15% 0px -75% 0px',
    threshold: 0
  });

  spySections.forEach(sec => scrollSpyObserver.observe(sec));

  // 3. Interactive Data Table Filter (Priority Sectors)
  const filterButtons = document.querySelectorAll('.table-filter-btn');
  const tableRows = document.querySelectorAll('.priority-table-row');

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const filterCategory = btn.getAttribute('data-filter');

      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      tableRows.forEach(row => {
        const rowCategory = row.getAttribute('data-category');
        if (filterCategory === 'all' || rowCategory === filterCategory) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
    });
  });

  // 4. Interactive Risk Threshold Slider (Ideathon Showcase Feature)
  const riskSlider = document.getElementById('riskThresholdSlider');
  const cutoffValLabel = document.getElementById('cutoffValLabel');
  const highRiskHaLabel = document.getElementById('highRiskHaLabel');
  const highRiskPctLabel = document.getElementById('highRiskPctLabel');

  if (riskSlider) {
    riskSlider.addEventListener('input', (e) => {
      const cutoff = parseFloat(e.target.value);
      if (cutoffValLabel) cutoffValLabel.textContent = cutoff.toFixed(2);

      // Empirical risk distribution curve calculation
      let highPct = 0;
      if (cutoff <= 0.45) {
        highPct = 58.57 - (cutoff - 0.35) * 171.4;
      } else if (cutoff <= 0.58) {
        highPct = 41.43 - (cutoff - 0.45) * 180.7;
      } else {
        highPct = 17.93 - (cutoff - 0.58) * 105.4;
      }

      highPct = Math.max(1.0, Math.min(95.0, highPct));
      const highHa = (22702.47 * (highPct / 100.0)).toFixed(1);

      if (highRiskHaLabel) highRiskHaLabel.textContent = `${Number(highHa).toLocaleString()} ha`;
      if (highRiskPctLabel) highRiskPctLabel.textContent = `${highPct.toFixed(1)}%`;
    });
  }

  // 5. Interactive Lightbox Modal
  const modal = document.getElementById('imageModal');
  const modalImg = document.getElementById('modalImage');
  const modalCaption = document.getElementById('modalCaption');
  const modalTag = document.getElementById('modalTag');
  const closeModal = document.querySelector('.modal-close');

  const triggerImages = document.querySelectorAll('.lightbox-trigger');

  triggerImages.forEach(img => {
    img.addEventListener('click', () => {
      if (modal) {
        modal.classList.add('active');
        modalImg.src = img.src;
        modalCaption.textContent = img.getAttribute('data-caption') || img.alt;
        if (modalTag) {
          modalTag.textContent = img.getAttribute('data-tag') || 'EPSG:32644 - UTM Zone 44N';
        }
      }
    });
  });

  if (closeModal) {
    closeModal.addEventListener('click', () => {
      modal.classList.remove('active');
    });
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  }

  // 6. Copy Command to Clipboard
  const copyBtn = document.getElementById('copyCmdBtn');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const cmdText = "python soilguard-cg/src/run_full_demo.py";
      navigator.clipboard.writeText(cmdText).then(() => {
        copyBtn.textContent = "COPIED! ✓";
        setTimeout(() => {
          copyBtn.textContent = "COPY COMMAND";
        }, 2000);
      });
    });
  }
});
