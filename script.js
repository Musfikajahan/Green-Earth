const categoriesList = document.getElementById('categoriesList');
const productsGrid = document.getElementById('products-grid');
const cartItemsList = document.getElementById('cart-items');
const cartTotalEl = document.getElementById('cart-total');

let cart = [];

const updateCartUI = () => {
  cartItemsList.innerHTML = '';
  let total = 0;

  cart.forEach((item, index) => {
    total += item.price;

    const li = document.createElement('li');
    li.className = "flex justify-between items-center bg-white rounded px-2 py-1 mb-1 shadow-sm";

    li.innerHTML = `
      <span class="text-sm font-medium">${item.name}</span>
      <div class="flex items-center gap-2">
        <span class="text-sm font-semibold text-gray-700">৳${item.price}</span>
        <button class="text-red-500 hover:text-red-700 text-sm font-bold">&times;</button>
      </div>
    `;

    li.querySelector('button').addEventListener('click', () => {
      cart.splice(index, 1);
      updateCartUI();
    });

    cartItemsList.appendChild(li);
  });

  cartTotalEl.textContent = total;
};

const modal = document.createElement('div');
modal.id = 'plant-modal';
modal.style.display = 'none';  
modal.className = 'fixed inset-0 bg-black/40 flex items-center justify-center z-50';
modal.innerHTML = `
  <div class="bg-white rounded-xl p-6 max-w-md w-full shadow-lg relative">
    <button class="absolute top-1 right-2 text-gray-800 text-2xl font-bold" id="close-modal-btn">&times;</button>
    <div id="modal-content"></div>
  </div>
`;
document.body.appendChild(modal);

modal.querySelector('#close-modal-btn').onclick = () => {
  modal.style.display = 'none';
};

modal.addEventListener('click', (event) => {
  if (event.target === modal) {
    modal.style.display = 'none';
  }
});

function showPlantModal(id) {
  modal.style.display = 'flex';
  document.getElementById('modal-content').innerHTML = `
    <div class="flex justify-center items-center h-40">
      <div class="h-12 w-12">Loading...</div>
    </div>
  `;

  fetch(`https://openapi.programming-hero.com/api/plant/${id}`)
    .then(res => res.json())
    .then(data => {
      if (!data || !data.plants) {
        console.error("Plant not found in API:", data);
        document.getElementById('modal-content').innerHTML = `<p class="text-center text-red-500">Plant data not found.</p>`;
        return;
      }

      const plant = data.plants;

      const content = `
        <div class="mb-4">
          <h3 class="text-xl font-bold mb-1 text-left">${plant.name}</h3>
          <img src="${plant.image}" alt="${plant.name}" class="rounded-xl w-full h-52 object-cover mb-3" />
        </div>
        <div class="mb-2">
          <span class="font-semibold">Category:</span>
          <span class="ml-1">${plant.category ?? ''}</span>
        </div>
        <div class="mb-2">
          <span class="font-semibold">Price:</span>
          <span class="ml-1">৳${plant.price ?? ''}</span>
        </div>
        <div class="mb-2">
          <span class="font-semibold">Description:</span>
          <p class="text-gray-700 mt-1">${plant.description ?? ''}</p>
        </div>
      `;
      document.getElementById('modal-content').innerHTML = content;
    })
    .catch(err => {
      console.error("Error loading plant modal:", err);
      document.getElementById('modal-content').innerHTML = `<p class="text-center text-red-500">Failed to load plant data.</p>`;
    });
}


const displayPlants = (plants) => {
  productsGrid.innerHTML = '';
  if (!plants || plants.length === 0) {
    productsGrid.innerHTML = `<div class="col-span-full text-center py-20">No plants found</div>`;
    return;
  }

  plants.forEach(plant => {
    const card = document.createElement('div');
    card.className = 'rounded-xl bg-white border border-gray-100 shadow p-4 flex flex-col gap-3 transition cursor-pointer';
    card.dataset.plantId = plant.plantId ?? plant.id ?? plant._id;

    const figure = document.createElement('div');
    figure.className = 'rounded-xl bg-gray-100 flex items-center justify-center h-36 mb-2 overflow-hidden border border-dashed border-green-200';
    const img = document.createElement('img');
    img.src = plant.image ?? './assets/plant-placeholder.png';
    img.alt = plant.name ?? 'Plant Image';
    img.className = 'h-full w-full';
    figure.appendChild(img);

    const cardTitle = document.createElement('div');
    cardTitle.className = 'font-semibold text-base mt-2 mb-1';
    cardTitle.textContent = plant.name ?? 'Unnamed Plant';

    const desc = document.createElement('p');
    desc.className = 'text-gray-600 text-sm leading-snug mb-2';
    desc.textContent = plant.description ?? '';

    const row = document.createElement('div');
    row.className = 'flex justify-between items-center mt-2 mb-3';

    const catBadge = document.createElement('span');
    catBadge.className = 'bg-green-100 text-green-700 rounded-full px-3 py-1 text-xs font-medium';
    catBadge.textContent = plant.category ?? 'Category';

    const price = document.createElement('span');
    price.className = 'text-gray-800 font-bold text-base';
    price.textContent = `৳${plant.price ?? 'N/A'}`;

    row.appendChild(catBadge);
    row.appendChild(price);

    const button = document.createElement('button');
    button.className = 'mt-2 rounded-full w-full bg-green-600 text-white font-semibold py-2 hover:bg-green-700 transition';
    button.textContent = 'Add to Cart';

    button.addEventListener('click', (e) => {
      e.stopPropagation();
      cart.push({
        name: plant.name ?? 'Unnamed Plant',
        price: plant.price ?? 0
      });
      updateCartUI();
    });

    card.appendChild(figure);
    card.appendChild(cardTitle);
    card.appendChild(desc);
    card.appendChild(row);
    card.appendChild(button);

    card.addEventListener('click', () => {
      showPlantModal(card.dataset.plantId);
    });

    productsGrid.appendChild(card);
  });
};

const loadAllPlants = () => {
  productsGrid.innerHTML = `<div class="col-span-full text-center py-20">Loading...</div>`;
  fetch('https://openapi.programming-hero.com/api/categories')
    .then(res => res.json())
    .then(data => {
      const categories = data.data ?? data.categories;
      const allPlants = [];
      const fetches = categories.map(cat =>
        fetch(`https://openapi.programming-hero.com/api/category/${cat.id ?? cat.categoryId}`)
          .then(res => res.json())
          .then(data => {
            if (data.plants) {
              allPlants.push(...data.plants);
            }
          })
      );
      Promise.all(fetches).then(() => {
        displayPlants(allPlants);
      });
    });
};

const loadCategories = () => {
  fetch('https://openapi.programming-hero.com/api/categories')
    .then(res => res.json())
    .then(data => {
      const categories = data.data ?? data.categories;
      categoriesList.innerHTML = '';

      categories.forEach(cat => {
        const li = document.createElement('li');
        li.textContent = cat.category_name ?? cat.title;
        li.className = "hover:border-b-4 hover:border-red-600 cursor-pointer py-1";
        li.dataset.categoryId = cat.category_id ?? cat.id ?? cat.categoryId;

        li.addEventListener('click', () => {
          categoriesList.querySelectorAll('li').forEach(el => el.classList.remove('border-b-4', 'border-red-600', 'font-bold'));
          li.classList.add('border-b-4', 'border-red-600', 'font-bold');

          loadPlantsByCategory(li.dataset.categoryId);
        });

        categoriesList.appendChild(li);
      });

      loadAllPlants();
    })
    .catch(err => console.error(err));
};

const loadPlantsByCategory = (categoryId) => {
  productsGrid.innerHTML = `<div class="col-span-full text-center py-20">Loading...</div>`;
  fetch(`https://openapi.programming-hero.com/api/category/${categoryId}`)
    .then(res => res.json())
    .then(data => {
      const plants = data.plants ?? [];
      displayPlants(plants);
    })
    .catch(err => console.log(err));
};



loadCategories();
