const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';

let currentPage = 1;
let isSearching = false;
let currentQuery = '';

// Elementos del DOM
const moviesGrid = document.getElementById('moviesGrid');
const searchInput = document.getElementById('searchInput');
const pageIndicator = document.getElementById('pageIndicator');
const btnNext = document.getElementById('nextPage');
const btnPrev = document.getElementById('prevPage');

// Función principal para obtener datos
async function fetchMovies(page, query = '') {
    let url = '';
    
    if (query) {
        // Si hay búsqueda, usamos el endpoint de search
        url = `${BASE_URL}/search/movie?api_key=${API_KEY}&language=es-ES&query=${encodeURIComponent(query)}&page=${page}`;
    } else {
        // Si no, mostramos las populares
        url = `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=es-ES&page=${page}`;
    }

    try {
        const res = await fetch(url);
        const data = await res.json();
        
        // Limpiamos y mostramos 12 resultados como pide el mandato
        renderMovies(data.results.slice(0, 12));
    } catch (error) {
        console.error("Error al obtener datos:", error);
    }
}

// Renderizar las tarjetas en el HTML
function renderMovies(movies) {
    moviesGrid.innerHTML = '';
    
    if (movies.length === 0) {
        moviesGrid.innerHTML = `<h3 class="text-center w-100 text-muted mt-5">No se encontraron películas para "${currentQuery}"</h3>`;
        return;
    }

    movies.forEach(movie => {
        const { title, poster_path, vote_average, overview } = movie;
        const movieEl = document.createElement('div');
        movieEl.classList.add('col');
        movieEl.innerHTML = `
            <div class="card movie-card h-100">
                <img src="${poster_path ? IMG_URL + poster_path : 'https://via.placeholder.com/500x750?text=No+Poster'}" class="card-img-top" alt="${title}">
                <div class="card-body">
                    <h5 class="card-title text-truncate">${title}</h5>
                    <div class="rating-badge mb-2">★ ${vote_average.toFixed(1)}</div>
                    <p class="card-text overview-text">${overview || 'Sinopsis no disponible en español.'}</p>
                </div>
            </div>
        `;
        moviesGrid.appendChild(movieEl);
    });
}

// Lógica de la Barra de Búsqueda Dinámica
searchInput.addEventListener('input', (e) => {
    currentQuery = e.target.value;
    currentPage = 1; // Reiniciar a página 1 al buscar algo nuevo
    pageIndicator.innerText = currentPage;

    if (currentQuery.trim() !== '') {
        isSearching = true;
        fetchMovies(currentPage, currentQuery);
    } else {
        isSearching = false;
        fetchMovies(currentPage);
    }
});

// Lógica de Paginación
btnNext.addEventListener('click', () => {
    currentPage++;
    updateUI();
});

btnPrev.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        updateUI();
    }
});

function updateUI() {
    pageIndicator.innerText = currentPage;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    if (isSearching) {
        fetchMovies(currentPage, currentQuery);
    } else {
        fetchMovies(currentPage);
    }
}

// Carga inicial
fetchMovies(currentPage);