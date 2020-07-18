import Search from './models/Search';
import * as searchView from './views/SearchView';
import { elements } from './views/base';

/***Global state 
* - Search object
* - Current recipe object
* - Shoping list object
* - Liked recipes
*/

const state = {};


const controlSearch = async () => {
    //1 get query from the view
    const query = searchView.getInput()

    if (query) {
        //2 new search object and add to state
        state.search = new Search(query)

        //3 prepare UI for results
        searchView.clearInput();
        searchView.clearResults()

        //4 search for recipes
        await state.search.getResults();

        //5 render resalts on UI
        searchView.renderResults(state.search.result);
    }
}

elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();

})

// search.getResults();