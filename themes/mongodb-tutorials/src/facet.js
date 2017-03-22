import React from 'react'


export default class Facet extends React.Component {
  constructor (props) {
    super(props)
    this.genButton = this.genButton.bind(this)
  }

  genButton (option, index) {
    let style = {
      backgroundColor: 'transparent'
    }

    if (option.active) {
      style.backgroundColor = 'red'
    }

    return (
      <button 
        key={ index }
        style={ style }
        data-facet-name={ this.props.name }
        onClick={ this.props.updateFacet }
      >
        { option.name }
      </button>
    )
  }

  render () {
    const activeOptions = this.props.options.filter(o => o.active == true)
    let allOption = { name: "All", active: true }

    if (activeOptions.length > 0) {
      allOption.active = false
    }
    
    const options = [
      allOption,
      ...this.props.options,
    ]

    const buttons = options.map(this.genButton)

    return (
      <div>
        <h2>{ this.props.name }</h2>
        { buttons }
      </div>
    )
  }
}
