import Search from './models/Search';
import Recipe from './models/Recipe';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import { elements, renderLoader, clearLoader, renderButtons } from './views/base';

/***Global state 
* - Search object
* - Current recipe object
* - Shoping list object
* - Liked recipes
*/

const state = {};

/*
*Search Controller
*/

const controlSearch = async () => {
    //1 get query from the view
    const query = searchView.getInput();

    if (query) {
        //2 new search object and add to state
        state.search = new Search(query)

        //3 prepare UI for results
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);

        try {
            //4 search for recipes
            await state.search.getResults();

            //5 render resalts on UI
            clearLoader();
            searchView.renderResults(state.search.result);
        } catch (error) {
            console.log(error)
            clearLoader();
        }
    }
}

elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
});


elements.searchResPage.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline')
    if (btn) {
        const goToPage = Number(btn.dataset.goto);
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);
    }
})

/*
*Recipe Controller
*/
const controlRecipe = async () => {
    //Get id from URL
    const id = window.location.hash.replace('#', '');
    if (id) {
        //Prepare UI for changes

        //Create new recipe object 
        state.recipe = new Recipe(id);


        try {
            //Get recipe data and parse ingredients
            await state.recipe.getRecipe();
            state.recipe.parceIngredients();

            //Calculate servings and time
            state.recipe.calcTime();
            state.recipe.calcServings();

            //Render recipe
            console.log(state.recipe);
        } catch (error) {
            console.log(error)
        }

    }
}

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe))