import React from 'react';
import axios from 'axios';
import styles from './App.module.css';
import { ReactComponent as Check } from './check.svg';

const API_ENDPOINT = 'https://hn.algolia.com/api/v1/search?query=';

const useSemiPersistentState = (key, initialState) => {
  const isMounted = React.useRef(false);
  const [value, setValue] = React.useState(
    localStorage.getItem(key) || initialState
  );

  React.useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
    } else {
      console.log('A');
      localStorage.setItem(key, value);
    }
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

const getSumComments = stories => stories.data.reduce(
  (result, story) => result + story.num_comments, 0
);

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
  const handleRemoveStory = React.useCallback(item => dispatchStories({ type: 'REMOVE_STORY', payload: item }), []);

  const sumComments = React.useMemo(() => getSumComments(stories), [stories]);

  return (
    <div className={styles.container}>
      <h1 className={styles.headlinePrimary}>My Hacker Stories with {sumComments} comments.</h1>
      <SearchForm searchTerm={searchTerm} onSearchInput={handleSearchInput} onSearchSumbit={handleSearchSubmit} />
      {stories.isError && <p>Something went wrong.</p>}
      {stories.isLoading ?
        <p>Loading ...</p>
        :
        <List stories={stories.data} onRemoveItem={handleRemoveStory} />
      }
    </div>
  );
}

const SearchForm = ({ searchTerm, onSearchInput, onSearchSumbit }) =>
  <>
    <form onSubmit={onSearchSumbit} className={styles.searchForm}>
      <InputWithLabel id='search' value={searchTerm} onInputChange={onSearchInput} isFocused={true}>
        <strong>Search:</strong>
      </InputWithLabel>
      &nbsp;
      <button type='submit' disabled={!searchTerm} className={`${styles.button} ${styles.buttonLarge}`}>Submit</button>
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
      <label htmlFor={id} className={styles.label}>{children}</label>
      &nbsp;
      <input ref={inputRef} id={id} type={type} value={value} onChange={onInputChange} className={styles.input} />
    </>
  )
}

const List = React.memo(({ stories, onRemoveItem }) =>
  stories.map(item =>
    <Item key={item.objectID} item={item} onRemoveItem={onRemoveItem} />
  ));

const Item = ({ item, onRemoveItem }) =>
  <div className={styles.item}>
    <span style={{ width: '40%' }}>
      <a href={item.url}>{item.title}</a>
    </span>&nbsp;
    <span style={{ width: '30%' }}>{item.author}</span>&nbsp;
    <span style={{ width: '10%' }}>{item.num_comments}</span>&nbsp;
    <span style={{ width: '10%' }}>{item.points}</span>&nbsp;
    <span style={{ width: '10%' }}>
      <button
        className={`${styles.button} ${styles.buttonSmall}`}
        type='button'
        onClick={() => onRemoveItem(item)}
      >
        <Check height='18px' width='18px' />
      </button>
    </span>
  </div>

export default App;
