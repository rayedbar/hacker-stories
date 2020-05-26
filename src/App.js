import React from 'react';
import axios from 'axios';
import './App.css';

const API_ENDPOINT = 'https://hn.algolia.com/api/v1/search?query=';

const useSemiPersistentState = (key, initialState) => {
  const [value, setValue] = React.useState(
    localStorage.getItem(key) || initialState
  );

  React.useEffect(() => {
    localStorage.setItem(key, value)
  }, [value, key]);

  return [value, setValue];
}

const storiesReducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_INIT':
      return {
        ...state,
        isLoading: true,
        isError: false
      };
    case 'FETCH_FAILURE':
      return {
        ...state,
        isLoading: false,
        isError: true
      };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        data: action.payload,
        isLoading: false,
        isError: false
      };
    case 'REMOVE_STORY':
      return {
        ...state,
        data: state.data.filter(story => story.objectID !== action.payload.objectID)
      };
    default:
      throw new Error();
  }
}

const App = () => {
  const [searchTerm, setSearchTerm] = useSemiPersistentState('search', 'React');
  const [url, setUrl] = React.useState(`${API_ENDPOINT}${searchTerm}`);

  const [stories, dispatchStories] = React.useReducer(
    storiesReducer,
    { data: [], isLoading: false, isError: false }
  );

  const handleFetchStories = React.useCallback(async () => {
    dispatchStories({ type: 'FETCH_INIT' });
    try {
      const result = await axios.get(url);
      dispatchStories({ type: 'FETCH_SUCCESS', payload: result.data.hits });
    } catch {
      dispatchStories({ type: 'FETCH_FAILURE' });
    }
  }, [url]);

  React.useEffect(() => {
    handleFetchStories();
  }, [handleFetchStories]);

  const handleSearchInput = event => setSearchTerm(event.target.value);
  const handleSearchSubmit = () => setUrl(`${API_ENDPOINT}${searchTerm}`);
  const handleRemoveStory = item => dispatchStories({ type: 'REMOVE_STORY', payload: item });

  return (
    <>
      <h1>My Hacker Stories</h1>
      <SearchForm searchTerm={searchTerm} onSearchInput={handleSearchInput} onSearchSumbit={handleSearchSubmit} />
      <hr />
      {stories.isError && <p>Something went wrong.</p>}
      {stories.isLoading ?
        <p>Loading ...</p>
        :
        <List stories={stories.data} onRemoveItem={handleRemoveStory} />
      }
    </>
  );
}

const SearchForm = ({ searchTerm, onSearchInput, onSearchSumbit }) =>
  <>
    <form onSubmit={onSearchSumbit}>
      <InputWithLabel id='search' value={searchTerm} onInputChange={onSearchInput} isFocused={true}>
        <strong>Search:</strong>
      </InputWithLabel>
      &nbsp;
      <button type='submit' disabled={!searchTerm}>Submit</button>
    </form>
  </>

const InputWithLabel = ({ id, value, type = 'text', onInputChange, isFocused, children }) => {
  const inputRef = React.useRef()

  React.useEffect(() => {
    if (isFocused) {
      inputRef.current.focus();
    }
  }, [isFocused])

  return (
    <>
      <label htmlFor={id}>{children}</label>
      &nbsp;
      <input ref={inputRef} id={id} type={type} value={value} onChange={onInputChange} />
    </>
  )
}

const List = ({ stories, onRemoveItem }) =>
  <ul>
    {stories.map(item =>
      <Item key={item.objectID} item={item} onRemoveItem={onRemoveItem} />
    )}
  </ul>

const Item = ({ item, onRemoveItem }) =>
  <li>
    <span>
      <a href={item.url}>{item.title}</a>
    </span>&nbsp;
    <span>{item.author}</span>&nbsp;
    <span>{item.num_comments}</span>&nbsp;
    <span>{item.points}</span>&nbsp;
    <span>
      <button type='button' onClick={() => onRemoveItem(item)}>Dismiss</button>
    </span>
  </li>

export default App;
