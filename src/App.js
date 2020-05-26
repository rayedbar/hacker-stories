import React from 'react';
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

  const handleFetchStories = React.useCallback(() => {
    dispatchStories({ type: 'FETCH_INIT' });
    fetch(url)
      .then(response => response.json())
      .then(response => dispatchStories({ type: 'FETCH_SUCCESS', payload: response.hits }))
      .catch(() => dispatchStories({ type: 'FETCH_FAILURE' }));
  }, [url])

  React.useEffect(() => {
    handleFetchStories();
  }, [handleFetchStories]);

  const handleSearch = event => setSearchTerm(event.target.value);
  const handleSearchSubmit = () => setUrl(`${API_ENDPOINT}${searchTerm}`);
  const handleRemoveStory = item => dispatchStories({ type: 'REMOVE_STORY', payload: item });

  return (
    <>
      <h1>My Hacker Stories</h1>
      <InputWithLabel id='search' value={searchTerm} onInputChange={handleSearch} isFocused={true}>
        <strong>Search:</strong>
      </InputWithLabel>
      &nbsp;
      <button type='button' disabled={!searchTerm} onClick={handleSearchSubmit}>Submit</button>
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
