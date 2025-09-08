const categoriesList = document.getElementById('categoriesList');

const loadCategories = () => {
  fetch('https://openapi.programming-hero.com/api/categories')
    .then(res => res.json())
    .then(data => {
      const categories = data.data ?? data.categories; // adjust based on API response
      categories.forEach(cat => {
        const li = document.createElement('li');
        li.textContent = cat.category_name ?? cat.title; // adapt property name as needed
        li.className = "hover:border-b-4 hover:border-red-600 cursor-pointer py-1";
        li.addEventListener('click', () => {
          // Call a function to load plants for this category, e.g.:
          loadPlantsByCategory(li.textContent);
        });
        categoriesList.appendChild(li);
      });
    })
    .catch(err => console.error(err));
};

const loadPlantsByCategory = (categoryName) => {
  console.log('Load plants for category:', categoryName);
  // Add your code here to fetch and display plants by category
};

loadCategories();
