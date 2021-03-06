// @flow

import { DOM as dom, PropTypes, Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import actions from "../actions";
import { getSelectedSource, getSourceText } from "../selectors";
import { isEnabled } from "devtools-config";
import { getSymbols } from "../utils/parser";
import "./Outline.css";

class Outline extends Component {
  state: any;

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentWillUpdate({ sourceText }) {
    this.setSymbolDeclarations(sourceText);
  }

  async setSymbolDeclarations(sourceText) {
    const symbolDeclarations = await getSymbols(sourceText.toJS());

    this.setState({
      symbolDeclarations
    });
  }

  renderFunction(func) {
    return dom.li({}, func.value);
  }

  renderFunctions() {
    const { symbolDeclarations } = this.state;
    if (!symbolDeclarations) {
      return;
    }

    const { functions } = symbolDeclarations;

    return functions
      .filter(func => func.value != "anonymous")
      .map(this.renderFunction);
  }

  render() {
    if (!isEnabled("outline")) {
      return null;
    }

    return dom.div(
      { className: "outline" },
      dom.ul({}, this.renderFunctions())
    );
  }
}

Outline.propTypes = {
  selectedSource: PropTypes.object
};

Outline.displayName = "Outline";

export default connect(
  state => {
    const selectedSource = getSelectedSource(state);
    const sourceId = selectedSource ? selectedSource.get("id") : null;

    return {
      sourceText: getSourceText(state, sourceId)
    };
  },
  dispatch => bindActionCreators(actions, dispatch)
)(Outline);
