(function () {
  var grid = document.getElementById('portfolio-grid');
  if (!grid) return;

  var ICONS = {
    land: '<svg class="property-card__icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="8" width="18" height="12" rx="1"/><path d="M8 8V5h8v3"/></svg>',
    built: '<svg class="property-card__icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="1"/><path d="M4 9h16M9 4v16"/></svg>',
    bedrooms: '<svg class="property-card__icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 11h16v8H4z"/><path d="M7 11V7h10v4"/></svg>',
    suites: '<svg class="property-card__icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14v7H5z"/><path d="M8 12V8h8v4"/></svg>',
    parking: '<svg class="property-card__icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 14h16l-2 5H6z"/><circle cx="7.5" cy="19.5" r="1.5"/><circle cx="16.5" cy="19.5" r="1.5"/></svg>'
  };

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function getSiteRoot() {
    var path = window.location.pathname;
    if (/\.html$/i.test(path)) {
      return path.replace(/\/[^/]+$/, '/') || '/';
    }
    if (path.endsWith('/')) return path;
    return path.replace(/\/[^/]+$/, '/') || '/';
  }

  function resolveAsset(path) {
    if (!path) return '';
    if (/^(https?:|data:|\/)/i.test(path)) return path;
    return getSiteRoot() + path.replace(/^\.\//, '');
  }

  function parsePrice(preco) {
    if (!preco) return null;
    var digits = String(preco).replace(/\D/g, '');
    return digits ? parseInt(digits, 10) : null;
  }

  fetch(resolveAsset('data/properties.json'))
    .then(function (res) { return res.json(); })
    .then(function (properties) {
      properties.sort(function (a, b) {
        var pa = parsePrice(a.preco);
        var pb = parsePrice(b.preco);
        if (pa == null && pb == null) return 0;
        if (pa == null) return -1;
        if (pb == null) return 1;
        return pa - pb;
      });

      properties.forEach(function (p) {
        var cover = resolveAsset((p.fotos && p.fotos[0]) || '');
        var card = document.createElement('a');
        card.className = 'property-card';
        card.href = 'imovel?id=' + encodeURIComponent(p.id);
        card.setAttribute('role', 'listitem');
        card.setAttribute('aria-label', p.titulo + ' — ' + p.bairro);

        var parkingHidden = p.vagas ? '' : ' hidden';
        var parkingLabel = p.vagas || '— vagas';
        var priceHtml = p.preco
          ? '<p class="property-card__price">' + escapeHtml(p.preco) + '</p>'
          : '';

        card.innerHTML =
          '<div class="property-card__media">' +
            '<img class="property-card__image" src="' + escapeHtml(cover) + '" alt="' + escapeHtml(p.titulo) + '" loading="lazy">' +
            '<div class="property-card__overlay">' +
              '<div class="property-card__top">' +
                '<div class="property-card__location">' +
                  '<span class="property-card__city">' + escapeHtml(p.cidade) + '</span>' +
                  '<span class="property-card__neighborhood">' + escapeHtml(p.bairro) + '</span>' +
                '</div>' +
              '</div>' +
              '<img src="images/logo-marcelo-antonio.png" alt="" class="property-card__mark" aria-hidden="true">' +
              '<div class="property-card__bottom">' +
                '<p class="property-card__type">' + escapeHtml(p.titulo) + '</p>' +
                '<ul class="property-card__specs" aria-label="Dados do imóvel">' +
                  '<li class="property-card__spec">' + ICONS.land + '<span>' + escapeHtml(p.terreno) + '</span></li>' +
                  '<li class="property-card__spec">' + ICONS.built + '<span>' + escapeHtml(p.construida) + '</span></li>' +
                  '<li class="property-card__spec">' + ICONS.bedrooms + '<span>' + escapeHtml(p.dormitorios) + '</span></li>' +
                  '<li class="property-card__spec">' + ICONS.suites + '<span>' + escapeHtml(p.suites) + '</span></li>' +
                  '<li class="property-card__spec"' + parkingHidden + '>' + ICONS.parking + '<span>' + escapeHtml(parkingLabel) + '</span></li>' +
                '</ul>' +
                priceHtml +
              '</div>' +
            '</div>' +
          '</div>';

        grid.appendChild(card);
      });
    })
    .catch(function (err) {
      console.error('Erro ao carregar portfólio:', err);
    });
})();
