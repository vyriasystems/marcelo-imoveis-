(function () {
  var params = new URLSearchParams(window.location.search);
  var id = params.get('id');
  if (!id) return;

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  fetch('data/properties.json')
    .then(function (res) { return res.json(); })
    .then(function (properties) {
      var p = properties.find(function (item) { return item.id === id; });
      if (!p) return;

      var fotos = Array.isArray(p.fotos) ? p.fotos.filter(Boolean) : [];
      if (!fotos.length) return;

      document.title = p.titulo + ' — Marcelo Antonio Imóveis';

      document.getElementById('breadcrumb-bairro').textContent = p.bairro;
      document.getElementById('property-location').textContent = p.bairro + ' · ' + p.cidade;
      document.getElementById('property-title').textContent = p.titulo;
      document.getElementById('property-price').textContent = p.preco;

      var mensagem = encodeURIComponent('Olá! Tenho interesse no imóvel: ' + p.titulo + ' (' + p.bairro + ', ' + p.preco + ')');
      var waLink = 'https://wa.me/' + (p.corretor ? p.corretor.whatsapp : '5562995747746') + '?text=' + mensagem;

      document.getElementById('property-cta').href = waLink;
      document.getElementById('property-whatsapp-link').href = waLink;

      // Galeria principal: capa + thumbs + setas anterior/próxima
      var galleryMain = document.getElementById('property-gallery-main');
      var currentIndex = 0;
      var mainHtml =
        '<div class="gallery-main-image">' +
          '<img id="property-main-photo" src="' + escapeHtml(fotos[0]) + '" alt="' + escapeHtml(p.titulo) + '">' +
          '<button type="button" class="property-gallery-nav property-gallery-nav--prev" id="property-photo-prev" aria-label="Foto anterior">' +
            '<span aria-hidden="true">‹</span>' +
          '</button>' +
          '<button type="button" class="property-gallery-nav property-gallery-nav--next" id="property-photo-next" aria-label="Próxima foto">' +
            '<span aria-hidden="true">›</span>' +
          '</button>' +
          '<p class="property-gallery-counter" id="property-photo-counter" aria-live="polite">1 / ' + fotos.length + '</p>' +
        '</div>' +
        '<div class="property-gallery-thumbs" role="list" aria-label="Fotos do imóvel">';

      fotos.forEach(function (foto, index) {
        mainHtml +=
          '<button type="button" class="property-gallery-thumb' + (index === 0 ? ' is-active' : '') + '" role="listitem" data-photo-index="' + index + '" aria-label="Foto ' + (index + 1) + '">' +
            '<img src="' + escapeHtml(foto) + '" alt="' + escapeHtml(p.titulo) + ' — foto ' + (index + 1) + '">' +
          '</button>';
      });

      mainHtml += '</div>';
      galleryMain.innerHTML = mainHtml;
      galleryMain.classList.toggle('has-many-thumbs', fotos.length > 3);

      var mainPhoto = document.getElementById('property-main-photo');
      var thumbButtons = galleryMain.querySelectorAll('.property-gallery-thumb');
      var counterEl = document.getElementById('property-photo-counter');
      var prevBtn = document.getElementById('property-photo-prev');
      var nextBtn = document.getElementById('property-photo-next');

      function showPhoto(index) {
        if (!fotos.length) return;
        currentIndex = (index + fotos.length) % fotos.length;
        mainPhoto.src = fotos[currentIndex];
        mainPhoto.alt = p.titulo + ' — foto ' + (currentIndex + 1);
        if (counterEl) {
          counterEl.textContent = (currentIndex + 1) + ' / ' + fotos.length;
        }
        thumbButtons.forEach(function (item, i) {
          var active = i === currentIndex;
          item.classList.toggle('is-active', active);
          if (active && typeof item.scrollIntoView === 'function') {
            item.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
          }
        });
      }

      thumbButtons.forEach(function (btn) {
        btn.addEventListener('click', function () {
          showPhoto(Number(btn.getAttribute('data-photo-index')));
        });
      });

      if (prevBtn) {
        prevBtn.addEventListener('click', function () {
          showPhoto(currentIndex - 1);
        });
      }

      if (nextBtn) {
        nextBtn.addEventListener('click', function () {
          showPhoto(currentIndex + 1);
        });
      }

      document.addEventListener('keydown', function (event) {
        if (event.key === 'ArrowLeft') showPhoto(currentIndex - 1);
        if (event.key === 'ArrowRight') showPhoto(currentIndex + 1);
      });

      if (fotos.length < 2) {
        if (prevBtn) prevBtn.hidden = true;
        if (nextBtn) nextBtn.hidden = true;
        if (counterEl) counterEl.hidden = true;
      }
      // Specs
      var specs = document.getElementById('property-specs');
      var specItems = [
        ['Área construída', p.construida],
        ['Área do terreno', p.terreno],
        ['Dormitórios', p.dormitorios],
        ['Suítes', p.suites]
      ];
      if (p.vagas) specItems.push(['Vagas', p.vagas]);
      if (p.banheiros) specItems.push(['Banheiros', p.banheiros]);
      if (p.valorCondominio) specItems.push(['Condomínio', p.valorCondominio]);
      if (p.iptu) specItems.push(['IPTU', p.iptu]);

      specs.innerHTML = specItems.map(function (item) {
        return '<div class="spec-item"><dt>' + escapeHtml(item[0]) + '</dt><dd class="spec-value spec-value--text">' + escapeHtml(item[1]) + '</dd></div>';
      }).join('');

      // Descrição e características
      document.getElementById('property-description').textContent = p.descricao;
      var features = document.getElementById('property-features');
      features.innerHTML = '';
      (p.caracteristicas || []).forEach(function (item) {
        var li = document.createElement('li');
        li.textContent = item;
        features.appendChild(li);
      });

      // Bairro
      document.getElementById('property-neighborhood').textContent = p.sobreOBairro || '';

      // Vídeo do imóvel (quando existir)
      var videoSection = document.getElementById('property-video-section');
      var videoEl = document.getElementById('property-video');
      if (videoSection && videoEl && p.video) {
        videoEl.src = p.video;
        videoEl.setAttribute('poster', fotos[0] || '');
        videoSection.hidden = false;
      } else if (videoSection) {
        videoSection.hidden = true;
      }

      // Galeria completa com todas as fotos do carrossel
      var galleryEl = document.getElementById('property-gallery');
      galleryEl.innerHTML = '';
      fotos.forEach(function (foto, index) {
        var wrapper = document.createElement('div');
        wrapper.className = 'gallery-slot property-gallery-slot';
        if (index === 0) wrapper.classList.add('gallery-slot--wide');
        wrapper.setAttribute('role', 'listitem');
        wrapper.innerHTML =
          '<img src="' + escapeHtml(foto) + '" alt="' + escapeHtml(p.titulo) + ' — foto ' + (index + 1) + '" loading="lazy">';
        galleryEl.appendChild(wrapper);
      });

      // Corretor
      if (p.corretor) {
        document.getElementById('property-agent-photo').src = p.corretor.foto;
        document.getElementById('property-agent-photo').alt = p.corretor.nome;
        document.getElementById('property-agent-name').textContent = p.corretor.nome;
        document.getElementById('property-agent-creci').textContent = p.corretor.creci;
        document.getElementById('property-agent-whatsapp').href = waLink;
      }

      // Imóveis relacionados
      var related = document.getElementById('related-properties');
      related.innerHTML = '';
      properties.filter(function (item) { return item.id !== p.id; })
        .slice(0, 3)
        .forEach(function (r) {
          var card = document.createElement('a');
          card.className = 'portfolio-card';
          card.href = 'imovel?id=' + encodeURIComponent(r.id);
          card.innerHTML =
            '<div class="portfolio-card-image"><img src="' + escapeHtml(r.fotos[0]) + '" alt="' + escapeHtml(r.titulo) + '"></div>' +
            '<p class="portfolio-card-location">' + escapeHtml(r.bairro) + '</p>' +
            '<h3 class="portfolio-card-title">' + escapeHtml(r.titulo) + '</h3>' +
            '<p class="portfolio-card-price">' + escapeHtml(r.preco) + '</p>';
          related.appendChild(card);
        });
    })
    .catch(function (err) {
      console.error('Erro ao carregar imóvel:', err);
    });
})();
