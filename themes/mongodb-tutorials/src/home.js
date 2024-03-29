import React from 'react'
import ReactDOM from 'react-dom'

import Facet from './facet.js'
import Search from './search.js'
import TutorialList from './tutorialList.js'
import util from './util.js'
import 'whatwg-fetch'


const baseURL = window.location.origin

class App extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      searchResults: null,
      options: [],
      tutorials: [],
      assetsPrefix: JSON.parse(props.mainprops).assetsPrefix || '',
    }

    this.updateFacet = this.updateFacet.bind(this)
    this.clearFacets = this.clearFacets.bind(this)
  }

  componentDidMount () {
    fetch(baseURL + this.state.assetsPrefix + '/tags.json').then((response) => {
      return response.json()
    }).then((data) => {
      this.setState({
        options: data.tags,
        tutorials: data.tutorials,
      })
    }).catch((err) => {
      // TODO: do something here
    })

    util.setupFeedback()
  }

  clearFacets () {
    const options = this.state.options.map(option => {
      option.active = false
      return option
    })

    this.setState({ options })
  }

  updateFacet (event) {
    const optionName = event.target.innerHTML

    const index = this.state.options.findIndex(option => option.name == optionName)

    let options = this.state.options
    let option = options[index]
    option.active = !option.active

    options = [
      ...options.slice(0, index),
      option,
      ...options.slice(index + 1, options.length)
    ]

    this.setState({ options })
  }

  onResults = (results) => {
    this.setState({searchResults: results})
  }

  render () {
    // TODO: This should be possible with reduce
    let facetNames = []
    this.state.options.map(option => {
      if (facetNames.indexOf(option.facet) == -1) {
        facetNames = [
          ...facetNames,
          option.facet
        ]
      }
    })

    const facets = facetNames.map((facet, i) => {
      const options = this.state.options.filter(o => o.facet == facet)
      return <Facet key={i} name={facet} options={options} updateFacet={this.updateFacet} />
    })

    const activeOptions = this.state.options.filter(option => option.active)

    const tutorialsMatchingFacets = this.state.tutorials.filter(tutorial => {
      let shouldInclude = true // by default show all the tutorials

      activeOptions.map(activeOption => {
        // Store each tutorial option ID in array
        const tutorialOptionIds = tutorial.options.map(tutorialOption => tutorialOption.id)
          // If an active option ID is not in the array, hide tutorial
          if (tutorialOptionIds.indexOf(activeOption.id) == -1) {
            shouldInclude = false
          }
      })

      return shouldInclude
    })

    let tutorials = tutorialsMatchingFacets

    if (this.state.searchResults !== null) {
      const tutorialsSet = new Set(tutorialsMatchingFacets.map(tutorial => tutorial.url))

      const tutorialURLs = this.state.searchResults.filter(slug => {
        return tutorialsSet.has(slug)
      })

      tutorials = tutorialURLs.map(url => {
        return tutorialsMatchingFacets.find(t => t.url === url)
      })
    }

    return (
      <div className="main">
        <aside className="main__sidebar">
          <div className="filter-header">
            <h5 className="filter-header__title">Filters</h5>
            <a onClick={this.clearFacets}><h5 className="filter-header__clear">X Clear Filters</h5></a>
          </div>
          <div className="filters">
            { facets }
          </div>
        </aside>

        <div className="main__content">
          <div className="tutorial-search__wrapper">
            <Search baseURL={baseURL + this.state.assetsPrefix} onResults={this.onResults} />
          </div>

          <h1 className="main__title">Tutorials</h1>
          <TutorialList tutorials={ tutorials } baseURL={baseURL + this.state.assetsPrefix} />
        </div>
      </div>
    )
  }
}

var main = document.getElementById('main')
ReactDOM.render(<App {...(main.dataset)} />, main)
