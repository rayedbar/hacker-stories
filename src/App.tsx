import React from 'react'
import axios from 'axios'
import styles from './App.module.css'
import { ReactComponent as Check } from './check.svg'

const API_ENDPOINT = 'https://hn.algolia.com/api/v1/search?query='

const useSemiPersistentState = (
  key: string,
  initialState: string
): [string, (value: string) => void] => {
  const isMounted = React.useRef(false)
  const [value, setValue] = React.useState(
    localStorage.getItem(key) || initialState
  )

  React.useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true
    } else {
      console.log('A')
      localStorage.setItem(key, value)
    }
  }, [value, key])

  return [value, setValue]
}

type Story = {
  objectID: string;
  url: string;
  title: string;
  author: string;
  numComments: number;
  points: number;
};

type Stories = Array<Story>;

type StoriesState = {
  data: Stories;
  isLoading: boolean;
  isError: boolean;
};

interface StoriesFetchInitAction {
  type: 'STORIES_FETCH_INIT';
}

interface StoriesFetchSuccessAction {
  type: 'STORIES_FETCH_SUCCESS';
  payload: Stories;
}

interface StoriesFetchFailureAction {
  type: 'STORIES_FETCH_FAILURE';
}

interface StoriesRemoveAction {
  type: 'REMOVE_STORY';
  payload: Story;
}

type StoriesAction =
  | StoriesFetchInitAction
  | StoriesFetchSuccessAction
  | StoriesFetchFailureAction
  | StoriesRemoveAction;

const storiesReducer = (state: StoriesState, action: StoriesAction) => {
  switch (action.type) {
    case 'STORIES_FETCH_INIT':
      return {
        ...state,
        isLoading: true,
        isError: false
      }
    case 'STORIES_FETCH_FAILURE':
      return {
        ...state,
        isLoading: false,
        isError: true
      }
    case 'STORIES_FETCH_SUCCESS':
      return {
        ...state,
        data: action.payload,
        isLoading: false,
        isError: false
      }
    case 'REMOVE_STORY':
      return {
        ...state,
        data: state.data.filter(
          (story) => story.objectID !== action.payload.objectID
        )
      }
    default:
      throw new Error()
  }
}

const getSumComments = (stories: Stories) =>
  stories.reduce((result, story) => result + story.numComments, 0)

const App = () => {
  const [searchTerm, setSearchTerm] = useSemiPersistentState('search', 'React')
  const [url, setUrl] = React.useState(`${API_ENDPOINT}${searchTerm}`)

  const [stories, dispatchStories] = React.useReducer(storiesReducer, {
    data: [],
    isLoading: false,
    isError: false
  })

  const handleFetchStories = React.useCallback(async () => {
    dispatchStories({ type: 'STORIES_FETCH_INIT' })
    try {
      const result = await axios.get(url)
      dispatchStories({
        type: 'STORIES_FETCH_SUCCESS',
        payload: result.data.hits
      })
    } catch {
      dispatchStories({ type: 'STORIES_FETCH_FAILURE' })
    }
  }, [url])

  React.useEffect(() => {
    handleFetchStories()
  }, [handleFetchStories])

  const handleSearchInput = (event: React.ChangeEvent<HTMLInputElement>) =>
    setSearchTerm(event.target.value)

  const handleSearchSubmit = (event: React.ChangeEvent<HTMLFormElement>) => {
    setUrl(`${API_ENDPOINT}${searchTerm}`)
    event.preventDefault()
  }

  const handleRemoveStory = React.useCallback(
    (item) => dispatchStories({ type: 'REMOVE_STORY', payload: item }),
    []
  )

  const sumComments = React.useMemo(() => getSumComments(stories.data), [
    stories
  ])

  return (
    <div className={styles.container}>
      <h1 className={styles.headlinePrimary}>
        My Hacker Stories with {sumComments} comments.
      </h1>
      <SearchForm
        searchTerm={searchTerm}
        onSearchInput={handleSearchInput}
        onSearchSubmit={handleSearchSubmit}
      />
      {stories.isError && <p>Something went wrong.</p>}
      {stories.isLoading ? (
        <p>Loading ...</p>
      ) : (
        <List list={stories.data} onRemoveItem={handleRemoveStory} />
      )}
    </div>
  )
}

type SearchFormProps = {
  searchTerm: string;
  onSearchInput: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSearchSubmit: (event: React.ChangeEvent<HTMLFormElement>) => void;
};

const SearchForm = ({
  searchTerm,
  onSearchInput,
  onSearchSubmit
}: SearchFormProps) => (
  <>
    <form onSubmit={onSearchSubmit} className={styles.searchForm}>
      <InputWithLabel
        id="search"
        value={searchTerm}
        onInputChange={onSearchInput}
        isFocused={true}
      >
        <strong>Search:</strong>
      </InputWithLabel>
      &nbsp;
      <button
        type="submit"
        disabled={!searchTerm}
        className={`${styles.button} ${styles.buttonLarge}`}
      >
        Submit
      </button>
    </form>
  </>
)

type InputWithLabelProps = {
  id: string;
  value: string;
  type?: string;
  onInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isFocused?: boolean;
  children: React.ReactNode;
};

const InputWithLabel = ({
  id,
  value,
  type = 'text',
  onInputChange,
  isFocused,
  children
}: InputWithLabelProps) => {
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (isFocused && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isFocused])

  return (
    <>
      <label htmlFor={id} className={styles.label}>
        {children}
      </label>
      &nbsp;
      <input
        ref={inputRef}
        id={id}
        type={type}
        value={value}
        onChange={onInputChange}
        className={styles.input}
      />
    </>
  )
}

type ListProps = {
  list: Stories;
  onRemoveItem: (item: Story) => void;
};

const List = ({ list, onRemoveItem }: ListProps) => (
  <>
    {list.map((item) => (
      <Item key={item.objectID} item={item} onRemoveItem={onRemoveItem} />
    ))}
  </>
)

type ItemProps = {
  item: Story;
  onRemoveItem: (item: Story) => void;
};

const Item = ({ item, onRemoveItem }: ItemProps) => (
  <div className={styles.item}>
    <span style={{ width: '40%' }}>
      <a href={item.url}>{item.title}</a>
    </span>
    &nbsp;
    <span style={{ width: '30%' }}>{item.author}</span>&nbsp;
    <span style={{ width: '10%' }}>{item.numComments}</span>&nbsp;
    <span style={{ width: '10%' }}>{item.points}</span>&nbsp;
    <span style={{ width: '10%' }}>
      <button
        className={`${styles.button} ${styles.buttonSmall}`}
        type="button"
        onClick={() => onRemoveItem(item)}
      >
        <Check height="18px" width="18px" />
      </button>
    </span>
  </div>
)

export default App

export { SearchForm, InputWithLabel, List, Item }
