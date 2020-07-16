import Search from './models/Search'

/***Global state 
* - Search object
* - Current recipe object
* - Shoping list object
* - Liked recipes
*/

const state = {}


const controlSearch = async () => {
    //1 get query from the view
    const query = 'pizza'

    if (query) {
        //2 new earch object and add to state
        state.search = new Search(query)
        //3 prepare UI for results

        //4 search for recipes
        await state.search.getResults();
        //5 render resalts on UI
        console.log(state.search.result)
    }
}

document.querySelector('.search').addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
})

// search.getResults();