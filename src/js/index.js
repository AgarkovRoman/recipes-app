import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
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
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        // Highlight selected search item
        if (state.search) searchView.highlightSelection(id)

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
            clearLoader();
            recipeView.renderRecipe(
                state.recipe,
                state.likes.isLiked(id),
            );
        } catch (error) {
            console.log(error)
        }

    }
}

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));

/*
*List Controller
*/
const controlList = () => {
    //create a new list If there in note yet
    if (!state.list) state.list = new List();

    //add each ingredients to the list an UI
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item)
    });
}

//handle delete and update list 
elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;

    //handle delete button
    if (e.target.matches('.shopping__delete, .shopping__delete *')) {
        //delete from state
        state.list.deleteItem(id)

        //delete from ui
        listView.deleteItem(id)

        // handle count update
    } else if (e.target.matches('.shopping__count-value')) {
        const val = parseFloat(e.target.value, 10);
        state.list.updateCount(id, val);
    }
})

/*
*Like Controller
*/

const controlLike = () => {
    if (!state.likes) state.likes = new Likes();
    const currentID = state.recipe.id;

    //user has NOT yet liked current recipe
    if (!state.likes.isLiked(currentID)) {
        //Add like to the state
        const newLike = state.likes.addLike(
            currentID,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img,
        );

        //Toggle the like button
        likesView.toggleLikeBtn(true);

        //Add like in Ui list
        likesView.renderLike(newLike);

        //User HAS current recipe 
    } else {
        //Remove like from the state
        state.likes.deleteLike(currentID);

        //Toggle the like button
        likesView.toggleLikeBtn(false);

        //Remove like from UI list
        likesView.deleteLike(currentID);
    }
    likesView.toggleLikeMenu(state.likes.getNumLikes());
}

// Restore likes recipes

window.addEventListener('load', () => {

    state.likes = new Likes();
    state.likes.readStorage();
    likesView.toggleLikeMenu(state.likes.getNumLikes());
    state.likes.likes.forEach(like => likesView.renderLike(like));

})


//Handling recipe button clicks
elements.recipe.addEventListener('click', e => {
    if (e.target.matches('.btn-decrease, .btn-decrease *')) {
        if (state.recipe.servings > 1) {
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe)
        }
    } else if (e.target.matches('.btn-increase, .btn-increase *')) {
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe)
    } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
        //Add ingridient to shoping list
        controlList();
    } else if (e.target.matches('.recipe__love, .recipe__love *')) {
        //Like controller
        controlLike();
    }
});