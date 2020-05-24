import React from 'react';
import './App.css';

const useSemiPersistentState = (key, initialState) => {
  const [value, setValue] = React.useState(
    localStorage.getItem(key) || initialState
  );

  React.useEffect(() => {
    localStorage.setItem(key, value)
  }, [value, key])

  return [value, setValue]
}

const App = () => {
  const stories = [
    {
      title: 'React',
      url: 'https://reactjs.org/',
      author: 'Jordan Walke',
      num_comments: 3,
      points: 4,
      objectID: 0,
    },
    {
      title: 'Redux',
      url: 'https://redux.js.org/',
      author: 'Dan Abramov, Andrew Clark',
      num_comments: 2,
      points: 5,
      objectID: 1,
    },
  ];

  const [searchTerm, setSearchTerm] = useSemiPersistentState('search', 'React');

  const searchChangeHandler = event =>
    setSearchTerm(event.target.value)

  const filteredStories = stories.filter(story =>
    story.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <h1>My Hacker Stories</h1>
      <Search searchTerm={searchTerm} searchChangeHandler={searchChangeHandler} />
      <hr />
      <List stories={filteredStories} />
    </>
  );
}

const Search = ({ searchTerm, searchChangeHandler }) =>
  <>
    <label htmlFor='search'>Search:&nbsp;</label>
    <input id='search' type='text' value={searchTerm} onChange={searchChangeHandler} />
  </>

const List = ({ stories }) =>
  <ul>
    {stories.map(({ objectID, ...item }) => <Item key={objectID} {...item} />)}
  </ul>

const Item = ({ title, url, author, num_comments, points }) =>
  <li>
    <span>
      <a href={url}>{title}</a>
    </span>&nbsp;
    <span>{author}</span>&nbsp;
    <span>{num_comments}</span>&nbsp;
    <span>{points}</span>
  </li>

export default App;
