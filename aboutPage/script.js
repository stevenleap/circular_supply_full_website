document.addEventListener('DOMContentLoaded', function() {

    // Reveal animations on scroll
    const animatedElements = document.querySelectorAll(
        '.circular__supply__about__title__main, ' +
        '.circular__supply__about__title__separator, ' +
        '.circular__supply__about__paragraph__block, ' +
        '.circular__supply__about__mission__box, ' +
        '.circular__supply__about__pillar__item, ' +
        '.circular__supply__about__founder__image__frame'
    );

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    });

    animatedElements.forEach(element => {
        observer.observe(element);
    });

    // Pillars interaction
    const pillarItems = document.querySelectorAll('.circular__supply__about__pillar__item');

    pillarItems.forEach((item, index) => {
        item.addEventListener('mouseenter', function() {
            pillarItems.forEach((otherItem, otherIndex) => {
                if (otherIndex !== index) {
                    otherItem.style.opacity = '0.6';
                    otherItem.style.transform = 'scale(0.98)';
                }
            });
        });

        item.addEventListener('mouseleave', function() {
            pillarItems.forEach(otherItem => {
                otherItem.style.opacity = '';
                otherItem.style.transform = '';
            });
        });
    });
});

  // Interactive hover effects for impact areas
  const impactAreas = document.querySelectorAll('.impact-area');

  impactAreas.forEach(area => {
    area.addEventListener('mouseenter', function() {
      impactAreas.forEach(otherArea => {
        if (otherArea !== area) {
          otherArea.style.opacity = '0.7';
        }
      });
    });

    area.addEventListener('mouseleave', function() {
      impactAreas.forEach(otherArea => {
        otherArea.style.opacity = '1';
      });
    });
  });
