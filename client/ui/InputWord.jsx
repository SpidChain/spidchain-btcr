import React from 'react'
import createReactClass from 'create-react-class'
import Autosuggest from 'react-autosuggest'

import bip39String from 'assets/bip39-english.txt'

const bip39 = bip39String.split('\n')

const getSuggestionValue = suggestion => suggestion

// Use your imagination to render suggestions.
const renderSuggestion = suggestion => (
  <div>
    {suggestion}
  </div>
)
const getSuggestions = value => {
  const inputValue = value.trim().toLowerCase()
  const inputLength = inputValue.length

  return inputLength === 0 || inputLength === 1
    ? []
    : bip39.filter(w => w.toLowerCase().slice(0, inputLength) === inputValue
  )
}

const InputWord = createReactClass({
  getInitialState: () => ({
    value: '',
    suggestions: []
  }),

  onChange (event, { newValue }) {
    this.setState({
      value: newValue
    })
  },

  // Autosuggest will call this function every time you need to update suggestions.
  // You already implemented this logic above, so just use it.
  onSuggestionsFetchRequested ({ value }) {
    this.setState({
      suggestions: getSuggestions(value)
    })
  },

  // Autosuggest will call this function every time you need to clear suggestions.
  onSuggestionsClearRequested () {
    this.setState({
      suggestions: []
    })
  },

  render () {
    const inputProps = {
      placeholder: this.props.placeholder,
      value: this.state.value,
      onChange: this.onChange,
      name: this.props.name,
      style:{width: '70em'}
    }
    return (
      <Autosuggest
        className='form-control'
        suggestions={this.state.suggestions}
        onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
        onSuggestionsClearRequested={this.onSuggestionsClearRequested}
        getSuggestionValue={getSuggestionValue}
        renderSuggestion={renderSuggestion}
        inputProps={inputProps}
        autoCapitalize='none' />
    )
  }
})

export default InputWord
