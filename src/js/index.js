import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const input = document.querySelector('.search-input');
const searchBtn = document.querySelector('.search-button');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');

let page = 1;
loadMoreBtn.style.display = 'none';
let lightbox = new SimpleLightbox('.gallery a', {
    captionsData: 'alt',
    captionDelay: 250,
});

searchBtn.addEventListener('click', handleSubmit);
loadMoreBtn.addEventListener('click', handleLoadMore);

async function handleSubmit(event) {
    event.preventDefault();
    gallery.innerHTML = '';
    const searchValue = input.value;
    if (searchValue === '') {
        Notiflix.Notify.warning('Field is empty');
        loadMoreBtn.style.display = 'none';
        return
    }
    
    try {
        const data = await fetchPictures(searchValue, page)
        if (data.totalHits === 0) {
            Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.');
            loadMoreBtn.style.display = 'none';
        }

        else if (data.hits.length > 0) {
            const markup = data.hits.map(image => {
                return `<div class="photo-card">
                        <a href="${image.largeImageURL}"><img class="photo-image" src="${image.webformatURL}" alt="${image.tags}" title="${image.tags}" loading="lazy" /></a>
                        <div class="info">
                            <p class="info-item"><b>Likes</b><span>${image.likes}</span></p>
                            <p class="info-item"><b>Views</b><span>${image.views}</span></p>
                            <p class="info-item"><b>Comments</b><span>${image.comments}</span></p>
                            <p class="info-item"><b>Downloads</b><span>${image.downloads}</span></p>
                        </div>
                    </div>`
            }).join('');
            gallery.innerHTML = markup;
            Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
            lightbox.refresh();
        }

        if (data.totalHits > 40) {
            loadMoreBtn.style.display = 'block';
        }
    }
    catch (error) {
        console.log(error);
    }
}

async function handleLoadMore() {
    page += 1;
    loadMoreBtn.style.display = 'none';
    const searchValue = input.value;
    try {
        const data = await fetchPictures(searchValue, page);
        const markup = data.hits.map(image => {
            return `<div class="photo-card">
                        <a href="${image.largeImageURL}"><img class="photo-image" src="${image.webformatURL}" alt="${image.tags}" title="${image.tags}" loading="lazy" /></a>
                        <div class="info">
                            <p class="info-item"><b>Likes</b><span>${image.likes}</span></p>
                            <p class="info-item"><b>Views</b><span>${image.views}</span></p>
                            <p class="info-item"><b>Comments</b><span>${image.comments}</span></p>
                            <p class="info-item"><b>Downloads</b><span>${image.downloads}</span></p>
                        </div>
                    </div>`
        }).join('');
        gallery.insertAdjacentHTML('beforeend', markup);
        lightbox.refresh();

        const pagesNumber = data.totalHits / (40 * page);
        if (pagesNumber <= 1) {
            return
        }

        loadMoreBtn.style.display = 'block';
    }
    catch (error) {
        console.log(error);
    }
}

async function fetchPictures(value) {
    try {
        const KEY = '32916519-81386942dc7a74703bbd5f731'
        const response = await axios.get(`https://pixabay.com/api/?key=${KEY}&q=${value}&orientation=horizontal&safesearch=true&image_type=photo&per_page=40&page=${page}`);
        return response.data;
    }
    catch (error) {
        throw new Error(error);
    }
}