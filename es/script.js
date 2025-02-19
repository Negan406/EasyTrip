document.addEventListener('DOMContentLoaded', () => {
  // Create global state object
  const state = {
    loading: false,
    page: 1,
    lastScroll: 0,
    filtersActive: 'All homes'
  };

  // Initialize all interactive elements
  initializeNavigation();
  initializeSidebar();
  initializeFilters();
  initializeSearchBar();
  initializeScrollHandlers();
  initializeHostFeatures();
  
  // Initial load of listings if on home page
  if (!window.location.pathname.includes('become-host.html')) {
    loadMoreListings();
  }

  if (window.location.pathname.includes('listing-details.html')) {
    initializeListingDetails();
  }

  function initializeNavigation() {
    // Logo click handler
    document.querySelector('.logo')?.addEventListener('click', () => {
      navigateWithTransition('index.html');
    });

    // Become host / Switch to traveling button
    const navigationButton = document.querySelector('.nav-right button:first-child');
    if (navigationButton) {
      navigationButton.addEventListener('click', () => {
        const currentPage = window.location.pathname;
        if (currentPage.includes('become-host.html')) {
          navigateWithTransition('index.html');
        } else {
          navigateWithTransition('become-host.html');
        }
      });
    }

    // Update button text based on current page
    if (navigationButton) {
      navigationButton.textContent = window.location.pathname.includes('become-host.html') 
        ? 'Switch to traveling' 
        : 'Become a host';
    }
  }

  function initializeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const profileMenu = document.querySelector('.profile-menu');
    const closeButton = document.querySelector('.close-sidebar');

    if (!sidebar || !overlay || !profileMenu || !closeButton) return;

    function toggleSidebar(show) {
      sidebar.classList.toggle('active', show);
      overlay.classList.toggle('active', show);
      document.body.style.overflow = show ? 'hidden' : '';
    }

    profileMenu.addEventListener('click', () => toggleSidebar(true));
    closeButton.addEventListener('click', () => toggleSidebar(false));
    overlay.addEventListener('click', () => toggleSidebar(false));

    // Make sidebar links interactive
    document.querySelectorAll('.sidebar-item').forEach(item => {
      item.addEventListener('click', (e) => {
        if (!item.getAttribute('href').startsWith('#')) {
          e.preventDefault();
          toggleSidebar(false);
          navigateWithTransition(item.getAttribute('href'));
        }
      });
    });
  }

  function initializeFilters() {
    const filterButtons = document.querySelectorAll('.filter-button');
    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        state.filtersActive = button.querySelector('span').textContent;
        
        if (!window.location.pathname.includes('become-host.html')) {
          const listings = document.querySelector('.listings');
          if (listings) {
            listings.style.opacity = '0';
            setTimeout(() => {
              loadMoreListings(true);
              listings.style.opacity = '1';
            }, 300);
          }
        }
      });
    });
  }

  function initializeSearchBar() {
    const searchBarButtons = document.querySelectorAll('.search-bar button');
    searchBarButtons.forEach(button => {
      button.addEventListener('click', () => {
        const searchDialog = createSearchDialog(button.textContent.trim());
        document.body.appendChild(searchDialog);
        searchDialog.showModal();

        // Set up search form submission
        const searchForm = searchDialog.querySelector('form');
        if (searchForm) {
          searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(searchForm);
            const searchParams = {
              location: formData.get('location'),
              dates: formData.get('dates'),
              guests: formData.get('guests'),
              minPrice: formData.get('minPrice'),
              maxPrice: formData.get('maxPrice')
            };
            performSearch(searchParams);
            searchDialog.close();
          });
        }
      });
    });
  }

  function createSearchDialog(type) {
    const dialog = document.createElement('dialog');
    dialog.className = 'search-dialog';
  
    let content = '';
    switch (type) {
      case 'Anywhere':
        content = `
          <form class="search-form">
            <input type="text" name="location" placeholder="Where are you going?" required>
            <div class="price-range">
              <input type="number" name="minPrice" placeholder="Min Price" min="0">
              <input type="number" name="maxPrice" placeholder="Max Price" min="0">
            </div>
            <button type="submit" class="cta-button">Search</button>
          </form>
        `;
        break;
      case 'Any week':
        content = `
          <form class="search-form">
            <input type="date" name="dates" required>
            <button type="submit" class="cta-button">Set Dates</button>
          </form>
        `;
        break;
      case 'Add guests':
        content = `
          <form class="search-form">
            <div class="guests-input">
              <label>Adults</label>
              <input type="number" name="guests" min="1" value="1" required>
            </div>
            <div class="guests-input">
              <label>Children</label>
              <input type="number" name="children" min="0" value="0">
            </div>
            <button type="submit" class="cta-button">Update Guests</button>
          </form>
        `;
        break;
    }

    dialog.innerHTML = `
      <div class="dialog-header">
        <h3>Search ${type}</h3>
        <button onclick="this.closest('dialog').close()">×</button>
      </div>
      <div class="dialog-content">
        ${content}
      </div>
    `;
    return dialog;
  }

  function performSearch(searchParams) {
    const listingsContainer = document.querySelector('.listings');
    if (!listingsContainer) return;

    // Show loading state
    listingsContainer.style.opacity = '0';
    const loadingSpinner = document.querySelector('.loading-spinner');
    if (loadingSpinner) {
      loadingSpinner.classList.add('active');
    }

    // Simulate search delay
    setTimeout(() => {
      // Filter listings based on search parameters
      listingsContainer.innerHTML = ''; // Clear existing listings
      
      // Generate filtered listings
      const numberOfResults = Math.floor(Math.random() * 10) + 5; // Random number of results
      const fragment = document.createDocumentFragment();
      
      for (let i = 0; i < numberOfResults; i++) {
        const listing = createListingCard(i);
        fragment.appendChild(listing);
      }

      // Update UI
      listingsContainer.appendChild(fragment);
      listingsContainer.style.opacity = '1';
      if (loadingSpinner) {
        loadingSpinner.classList.remove('active');
      }

      // Initialize the new listing cards
      initializeListingCards();

      // Show search results summary
      showSearchSummary(searchParams, numberOfResults);
    }, 1000);
  }

  function showSearchSummary(params, resultCount) {
    const main = document.querySelector('main');
    const existingSummary = document.querySelector('.search-summary');
    if (existingSummary) {
      existingSummary.remove();
    }

    const summary = document.createElement('div');
    summary.className = 'search-summary';
    summary.innerHTML = `
      <p>Found ${resultCount} properties${params.location ? ` in ${params.location}` : ''}
      ${params.dates ? ` for ${params.dates}` : ''}
      ${params.guests ? ` for ${params.guests} guests` : ''}
      ${(params.minPrice || params.maxPrice) ? ` within price range` : ''}</p>
    `;

    main.insertBefore(summary, main.firstChild);
  }

  function initializeScrollHandlers() {
    const backToTopButton = document.querySelector('.back-to-top');
    if (!backToTopButton) return;

    window.addEventListener('scroll', () => {
      const { scrollTop } = document.documentElement;
      backToTopButton.classList.toggle('visible', scrollTop > 500);
    });

    backToTopButton.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  function initializeHostFeatures() {
    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) {
      ctaButton.addEventListener('click', () => {
        showHostRegistrationModal();
      });
    }
  }

  function showHostRegistrationModal() {
    const modal = document.createElement('dialog');
    modal.className = 'host-registration-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <h2>Start Your Hosting Journey</h2>
        <form method="dialog">
          <input type="text" placeholder="Full Name" required>
          <input type="email" placeholder="Email" required>
          <input type="tel" placeholder="Phone Number" required>
          <button type="submit" class="cta-button">Continue</button>
        </form>
        <button class="close-modal" onclick="this.closest('dialog').close()">×</button>
      </div>
    `;
    document.body.appendChild(modal);
    modal.showModal();
  }

  function loadMoreListings(reset = false) {
    if (state.loading || window.location.pathname.includes('become-host.html')) return;
    
    const listingsContainer = document.querySelector('.listings');
    const loadingSpinner = document.querySelector('.loading-spinner');
    if (!listingsContainer || !loadingSpinner) return;

    state.loading = true;
    loadingSpinner.classList.add('active');

    if (reset) {
      listingsContainer.innerHTML = '';
      state.page = 1;
    }

    setTimeout(() => {
      const fragment = document.createDocumentFragment();
      for (let i = 0; i < 6; i++) {
        fragment.appendChild(createListingCard(state.page * 6 + i));
      }

      listingsContainer.appendChild(fragment);
      
      // Add "Show More" button if it doesn't exist
      let showMoreButton = document.querySelector('.show-more-button');
      if (!showMoreButton) {
        showMoreButton = document.createElement('div');
        showMoreButton.className = 'show-more-button';
        showMoreButton.innerHTML = `
          <button class="cta-button">
            <i class="fas fa-plus-circle"></i>
            Show More Listings
          </button>
        `;
        showMoreButton.addEventListener('click', () => loadMoreListings());
        listingsContainer.parentElement.insertBefore(showMoreButton, loadingSpinner);
      }

      state.page++;
      state.loading = false;
      loadingSpinner.classList.remove('active');
      initializeListingCards();
    }, 800);
  }

  function createListingCard(index) {
    const categories = [
      'beachhouse',
      'cabin',
      'apartment',
      'villa',
      'mountain',
      'pool',
      'urban',
      'luxury',
      'ski',
      'island',
      'vineyard',
      'farm',
      'historic',
      'castle'
    ];

    const titles = [
      'Luxurious Beachfront Villa',
      'Cozy Mountain Cabin',
      'Modern City Apartment',
      'Scenic Lake House',
      'Desert Oasis Retreat',
      'Tropical Paradise Home',
      'Historic Downtown Loft',
      'Rustic Forest Cabin',
      'Oceanview Penthouse',
      'Country Farm Estate',
      'Elegant Castle Suite',
      'Vineyard Guest House',
      'Island Beach Bungalow',
      'Ski-in Mountain Chalet'
    ];
    
    const prices = [150, 200, 300, 250, 180, 420, 195, 280, 350, 275, 500, 450, 380, 290];
    const randomTitle = titles[index % titles.length];
    const randomPrice = prices[index % prices.length];
    const randomCategory = categories[index % categories.length];
    
    const div = document.createElement('div');
    div.className = 'listing-card';
    div.innerHTML = `
      <div class="listing-image">
        <img src="https://source.unsplash.com/featured/600x400?${randomCategory},home,${index}" 
             alt="${randomTitle}"
             loading="lazy">
        <button class="favorite"><i class="far fa-heart"></i></button>
        <div class="image-gallery">
          <button class="gallery-nav prev"><i class="fas fa-chevron-left"></i></button>
          <button class="gallery-nav next"><i class="fas fa-chevron-right"></i></button>
          <div class="gallery-dots">
            <span class="dot active"></span>
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
          </div>
        </div>
      </div>
      <div class="listing-info">
        <div class="listing-title">
          <h3>${randomTitle}</h3>
          <div class="rating">
            <i class="fas fa-star"></i>
            <span>${(4 + Math.random() * 1).toFixed(2)}</span>
          </div>
        </div>
        <p class="listing-details">${Math.floor(Math.random() * 10) + 1} miles away</p>
        <p class="listing-dates">May ${Math.floor(Math.random() * 20) + 1}-${Math.floor(Math.random() * 20) + 1}</p>
        <p class="listing-price"><strong>$${randomPrice}</strong> night</p>
      </div>
    `;

    // Add hover effect
    div.addEventListener('mouseenter', () => {
      div.style.transform = 'scale(1.02)';
      div.style.transition = 'transform 0.2s ease';
    });

    div.addEventListener('mouseleave', () => {
      div.style.transform = 'scale(1)';
    });

    // Add favorite button functionality
    const favoriteButton = div.querySelector('.favorite');
    favoriteButton.addEventListener('click', (e) => {
      e.stopPropagation();
      const icon = favoriteButton.querySelector('i');
      icon.classList.toggle('fas');
      icon.classList.toggle('far');
      favoriteButton.style.color = icon.classList.contains('fas') ? '#FF385C' : '#FFFFFF';
    });

    // Add click handler to the listing card
    div.addEventListener('click', () => {
      const listingData = {
        id: index,
        title: randomTitle,
        price: randomPrice,
        category: randomCategory,
        rating: (4 + Math.random() * 1).toFixed(2),
        location: `${Math.floor(Math.random() * 10) + 1} miles away`,
        description: `Experience this stunning ${randomCategory} with breathtaking views and modern amenities. Perfect for your next getaway.`
      };
      
      // Store listing data in localStorage
      localStorage.setItem('selectedListing', JSON.stringify(listingData));
      
      // Navigate to listing details page
      navigateWithTransition('listing-details.html');
    });

    return div;
  }

  function initializeListingCards() {
    document.querySelectorAll('.listing-card').forEach(card => {
      card.addEventListener('mouseenter', () => {
        card.style.transform = 'scale(1.02)';
        card.style.transition = 'transform 0.2s ease';
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'scale(1)';
      });
    });

    document.querySelectorAll('.favorite').forEach(button => {
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        const icon = button.querySelector('i');
        icon.classList.toggle('fas');
        icon.classList.toggle('far');
        button.style.color = icon.classList.contains('fas') ? '#FF385C' : '#FFFFFF';
      });
    });
  }

  function navigateWithTransition(url) {
    document.body.style.opacity = '0';
    setTimeout(() => {
      window.location.href = url;
    }, 200);
  }

  const filters = document.querySelector('.filters');
  if (filters) {
    let isDown = false;
    let startX;
    let scrollLeft;

    filters.addEventListener('mousedown', (e) => {
      isDown = true;
      filters.style.cursor = 'grabbing';
      startX = e.pageX - filters.offsetLeft;
      scrollLeft = filters.scrollLeft;
    });

    filters.addEventListener('mouseleave', () => {
      isDown = false;
      filters.style.cursor = 'grab';
    });

    filters.addEventListener('mouseup', () => {
      isDown = false;
      filters.style.cursor = 'grab';
    });

    filters.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - filters.offsetLeft;
      const walk = (x - startX) * 2;
      filters.scrollLeft = scrollLeft - walk;
    });
  }

  function initializeListingDetails() {
    const listingData = JSON.parse(localStorage.getItem('selectedListing'));
    if (!listingData) return;

    // Update page content with listing data
    document.title = `${listingData.title} - EasyTrip`;
    document.getElementById('mainImage').src = `https://source.unsplash.com/featured/1200x800?${listingData.category},home`;
    document.getElementById('listingTitle').textContent = listingData.title;
    document.getElementById('rating').textContent = listingData.rating;
    document.getElementById('ratingSmall').textContent = listingData.rating;
    document.getElementById('location').textContent = listingData.location;
    document.getElementById('price').textContent = listingData.price;
    document.getElementById('description').textContent = listingData.description;

    // Load additional images
    const imageGrid = document.querySelector('.image-grid');
    for (let i = 1; i <= 4; i++) {
      const img = document.createElement('img');
      img.src = `https://source.unsplash.com/featured/600x400?${listingData.category},interior,${i}`;
      img.alt = `${listingData.title} image ${i}`;
      imageGrid.appendChild(img);
    }

    // Load amenities
    const amenities = [
      { icon: 'wifi', text: 'Fast wifi' },
      { icon: 'snowflake', text: 'Air conditioning' },
      { icon: 'tv', text: 'Smart TV' },
      { icon: 'utensils', text: 'Kitchen' },
      { icon: 'parking', text: 'Free parking' },
      { icon: 'swimming-pool', text: 'Pool' }
    ];

    const amenitiesGrid = document.querySelector('.amenities-grid');
    amenities.forEach(amenity => {
      const div = document.createElement('div');
      div.className = 'amenity-item';
      div.innerHTML = `
        <i class="fas fa-${amenity.icon}"></i>
        <span>${amenity.text}</span>
      `;
      amenitiesGrid.appendChild(div);
    });

    // Initialize booking form
    const bookingForm = document.querySelector('.booking-form');
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Booking successful! We will contact you shortly with the details.');
    });

    // Load reviews
    loadReviews();
  }

  function loadReviews() {
    const reviewsList = document.querySelector('.reviews-list');
    const reviews = generateRandomReviews();
  
    reviews.forEach(review => {
      const reviewCard = document.createElement('div');
      reviewCard.className = 'review-card';
      reviewCard.innerHTML = `
        <div class="review-header">
          <img src="${review.avatar}" alt="${review.name}" class="reviewer-avatar">
          <div class="reviewer-info">
            <h4>${review.name}</h4>
            <p class="review-date">${review.date}</p>
          </div>
        </div>
        <div class="review-content">
          <p>${review.content}</p>
        </div>
      `;
      reviewsList.appendChild(reviewCard);
    });
  }

  function generateRandomReviews() {
    const reviews = [];
    const numberOfReviews = 6;
  
    for (let i = 0; i < numberOfReviews; i++) {
      reviews.push({
        name: `Guest ${i + 1}`,
        avatar: `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'women' : 'men'}/${Math.floor(Math.random() * 100)}.jpg`,
        date: `${['January', 'February', 'March', 'April', 'May'][Math.floor(Math.random() * 5)]} 2023`,
        content: 'Great place to stay! The host was very accommodating and the location was perfect. Would definitely recommend!'
      });
    }
  
    return reviews;
  }

  const additionalStyles = document.createElement('style');
  additionalStyles.textContent = `
    .listing-image {
      position: relative;
      border-radius: 12px;
      overflow: hidden;
      aspect-ratio: 1;
    }

    .listing-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    .listing-card:hover .listing-image img {
      transform: scale(1.05);
    }

    .image-gallery {
      position: absolute;
      bottom: 16px;
      left: 0;
      right: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 8px;
    }

    .gallery-nav {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      background: rgba(255, 255, 255, 0.9);
      border: none;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.2s;
    }

    .listing-card:hover .gallery-nav {
      opacity: 1;
    }

    .gallery-nav.prev {
      left: 16px;
    }

    .gallery-nav.next {
      right: 16px;
    }

    .gallery-dots {
      display: flex;
      gap: 4px;
    }

    .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.5);
      transition: background-color 0.2s;
    }

    .dot.active {
      background: white;
    }

    .favorite {
      position: absolute;
      top: 16px;
      right: 16px;
      background: none;
      border: none;
      color: white;
      font-size: 24px;
      cursor: pointer;
      z-index: 2;
      text-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
  `;
  document.head.appendChild(additionalStyles);

  additionalStyles.textContent += `
    .filters {
      -webkit-overflow-scrolling: touch;
      scroll-behavior: smooth;
      scrollbar-width: none;
      position: relative;
    }

    .filters::after {
      content: '';
      position: absolute;
      right: 0;
      top: 0;
      height: 100%;
      width: 100px;
      background: linear-gradient(to right, transparent, var(--white));
      pointer-events: none;
    }

    .filter-button {
      white-space: nowrap;
    }

    @media (hover: hover) {
      .filters:hover {
        cursor: grab;
      }
      
      .filters:active {
        cursor: grabbing;
      }
    }
  `;
});