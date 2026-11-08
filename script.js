const apiUrl = 'https://jsonplaceholder.typicode.com';
const albumDropdown = document.getElementById('albumDropdown');
const loadingText = document.getElementById('loadingText');
const errorText = document.getElementById('errorText');
const contentBlock = document.getElementById('contentBlock');
const userCard = document.getElementById('userCard');
const photoGallery = document.getElementById('photoGallery');

let albumsList = [];

async function fetchAlbums() {
    loadingText.classList.remove('hidden');
    errorText.classList.add('hidden');
    
    try {
        const res = await fetch(`${apiUrl}/albums`);
        
        if (!res.ok) {
            throw new Error(`Статус ошибки: ${res.status}`);
        }
        
        albumsList = await res.json();
        
        albumDropdown.innerHTML = '<option value="">-- Выберите альбом --</option>';
        
        albumsList.forEach(album => {
            const opt = document.createElement('option');
            opt.value = album.id;
            opt.textContent = `${album.id}. ${album.title}`;
            albumDropdown.appendChild(opt);
        });
        
    } catch (err) {
        errorText.textContent = `Не удалось загрузить альбомы: ${err.message}`;
        errorText.classList.remove('hidden');
        albumDropdown.innerHTML = '<option value="">Ошибка загрузки</option>';
    } finally {
        loadingText.classList.add('hidden');
    }
}

albumDropdown.addEventListener('change', async function() {
    const currentId = this.value;
    
    userCard.innerHTML = '';
    photoGallery.innerHTML = '';
    errorText.classList.add('hidden');
    
    if (!currentId) {
        contentBlock.classList.add('hidden');
        return;
    }
    
    contentBlock.classList.remove('hidden');
    loadingText.classList.remove('hidden');
    
    const currentAlbum = albumsList.find(a => a.id == currentId);
    
    try {
        const [userReq, photosReq] = await Promise.all([
            fetch(`${apiUrl}/users/${currentAlbum.userId}`),
            fetch(`${apiUrl}/photos?albumId=${currentAlbum.id}`)
        ]);
        
        if (!userReq.ok || !photosReq.ok) {
            throw new Error('Ошибка при получении данных с сервера');
        }
        
        const userData = await userReq.json();
        const photosData = await photosReq.json();
        
        userCard.innerHTML = `
            <h3>Автор альбома</h3>
            <p><b>Имя:</b> ${userData.name}</p>
            <p><b>Username:</b> ${userData.username}</p>
            <p><b>Email:</b> ${userData.email}</p>
            <p><b>Фотографий:</b> ${photosData.length}</p>
        `;
        
        let htmlItems = '';
        photosData.forEach(photo => {
            htmlItems += `
                <div class="photo-item">
                    <a href="${photo.url}" target="_blank" rel="noopener noreferrer">
                        <img src="${photo.thumbnailUrl}" alt="${photo.title}">
                    </a>
                    <div class="photo-text" title="${photo.title}">${photo.title}</div>
                </div>
            `;
        });
        
        photoGallery.insertAdjacentHTML('beforeend', htmlItems);
        
    } catch (err) {
        errorText.textContent = `Ошибка: ${err.message}`;
        errorText.classList.remove('hidden');
    } finally {
        loadingText.classList.add('hidden');
    }
});

document.addEventListener('DOMContentLoaded', fetchAlbums);