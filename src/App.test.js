import React from 'react'
import renderer from 'react-test-renderer'
import App, { Item, List, SearchForm, InputWithLabel } from './App'

describe('Item', () => {
  const handleRemoveItem = jest.fn()
  const item = {
    title: 'React',
    url: 'https://reactjs.org/',
    author: 'Jordan Walke',
    num_comments: 3,
    points: 4,
    objectID: 0
  }

  let component
  beforeEach(() => {
    component = renderer.create(
      <Item item={item} onRemoveItem={handleRemoveItem} />
    )
  })

  it('renders all properties', () => {
    expect(component.root.findByType('a').props.href)
      .toEqual('https://reactjs.org/')
    expect(component.root.findAllByProps({ children: 'Jordan Walke' }).length)
      .toEqual(1)
  })

  it('calls onRemoveItem on button click', () => {
    component.root.findByType('button').props.onClick()
    expect(handleRemoveItem).toHaveBeenCalledTimes(1)
    expect(handleRemoveItem).toHaveBeenCalledWith(item)
    expect(component.root.findAllByType(Item).length).toEqual(1)
  })
})

describe('List', () => {
  const list = [
    {
      title: 'React',
      url: 'https://reactjs.org/',
      author: 'Jordan Walke',
      num_comments: 3,
      points: 4,
      objectID: 0
    },
    {
      title: 'Redux',
      url: 'https://redux.js.org/',
      author: 'Dan Abramov, Andrew Clark',
      num_comments: 2,
      points: 5,
      objectID: 1
    }
  ]

  let component
  beforeEach(() => {
    component = renderer.create(<List list={list} />)
  })

  it('renders two items', () => {
    expect(component.root.findAllByType(Item).length).toEqual(2)
  })
})

describe('Search Form', () => {
  const searchFormProps = {
    searchTerm: 'React',
    onSearchInput: jest.fn(),
    onSearchSubmit: jest.fn()
  }

  let component
  beforeEach(() => {
    component = renderer.create(<SearchForm {...searchFormProps} />)
  })

  it('renders the input field with its value', () => {
    expect(component.root.findByType(InputWithLabel).props.value)
      .toEqual('React')
  })

  it('changes the input field', () => {
    const pseudoEvent = { target: 'React' }
    component.root.findByType('input').props.onChange(pseudoEvent)
    expect(searchFormProps.onSearchInput).toHaveBeenCalledTimes(1)
    expect(searchFormProps.onSearchInput).toHaveBeenCalledWith(pseudoEvent)
  })

  it('submits the form', () => {
    const pseudoEvent = {}
    component.root.findByType('form').props.onSubmit(pseudoEvent)
    expect(searchFormProps.onSearchSubmit).toHaveBeenCalledTimes(1)
    expect(searchFormProps.onSearchSubmit).toHaveBeenCalledWith(pseudoEvent)
  })

  it('disables the button and prevents submit', () => {
    component.update(
      <SearchForm {...searchFormProps} searchTerm='' />
    )
    expect(component.root.findByType('button').props.disabled)
      .toBeTruthy()
  })
})
