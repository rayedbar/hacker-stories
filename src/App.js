import React from 'react';
import './App.css';

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

  const [searchTerm, setSearchTerm] = React.useState('React')

  const searchChangeHandler = event =>
    setSearchTerm(event.target.value)

  const filteredStories = stories.filter(story =>
      story.title.toLocaleLowerCase().includes(searchTerm.toLocaleLowerCase())
    );

  return (
    <div>
      <h1>My Hacker Stories</h1>
      <Search searchTerm={searchTerm} searchChangeHandler={searchChangeHandler} />
      <hr />
      <List stories={filteredStories} />
    </div>
  );
}

const Search = props =>
  <div>
    <label htmlFor='search'>Search:&nbsp;</label>
    <input id='search' type='text' value={props.searchTerm} onChange={props.searchChangeHandler} />
  </div>

const List = props =>
  props.stories.map(item =>
    <div key={item.objectID}>
      <span>
        <a href={item.url}>{item.title}</a>
      </span>&nbsp;
      <span>{item.author}</span>&nbsp;
      <span>{item.num_comments}</span>&nbsp;
      <span>{item.points}</span>
    </div>
  );

export default App;
