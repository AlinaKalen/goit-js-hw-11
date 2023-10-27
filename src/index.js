import Notiflix from 'notiflix';
import 'notiflix/dist/notiflix-3.2.6.min.css';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";

let page = 1;
const perPage = 40;
const apiKey = '40313621-9143b56d57bfc999f5bdb1732'; 
const baseURL = 'https://pixabay.com/api/';
const searchForm = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');
const loadMoreButton = document.querySelector('.load-more');
const notification = document.getElementById('notification');

searchForm.addEventListener('submit', (event) => {
  event.preventDefault();
  page = 1; 
  gallery.innerHTML = ''; 
  loadMoreButton.style.display = 'none'; 
  searchImages();
});

loadMoreButton.addEventListener('click', () => {
  page++;
  searchImages();
});

function searchImages() {
  const searchQuery = searchForm.searchQuery.value;
  if (searchQuery) {
    fetch(
      `${baseURL}?key=${apiKey}&q=${searchQuery}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${perPage}`
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.hits.length > 0) {
          data.hits.forEach((image) => {
            const imageCard = createImageCard(image);
            gallery.appendChild(imageCard);
          });

          if (page === 1) {
            const totalHits = data.totalHits;
            Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
          }

          if (data.totalHits > page * perPage) {
            loadMoreButton.style.display = 'block';
          } else {
            loadMoreButton.style.display = 'none';
            Notiflix.Notify.info("You've reached the end of the search results.");
          }
        } else {
          Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.');
        }
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        Notiflix.Notify.failure('An error occurred while fetching data.');
      });
  }
}

function createImageCard(image) {
  const imageCard = document.createElement('a');
  imageCard.href = image.largeImageURL;
  imageCard.classList.add('photo-card');
  imageCard.innerHTML = `
    <img src="${image.webformatURL}" alt="${image.tags}" loading="lazy" />
    <div class="info">
      <p class="info-item"><b>Likes:</b> ${image.likes}</p>
      <p class="info-item"><b>Views:</b> ${image.views}</p>
      <p class="info-item"><b>Comments:</b> ${image.comments}</p>
      <p class="info-item"><b>Downloads:</b> ${image.downloads}</p>
    </div>
  `;
  return imageCard;
}

const lightbox = new SimpleLightbox('.photo-card a');
lightbox.refresh();

window.scrollTo({
  top: document.body.scrollHeight,
  behavior: 'smooth',
});

let loading = false;

const observer = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting && !loading) {
    loading = true;
    page++;
    searchImages();
  }
});

observer.observe(loadMoreButton);
