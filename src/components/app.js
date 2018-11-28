import { h, Component } from 'preact';
import { Router } from 'preact-router';

import Header from './header';

import Home from 'async!../routes/home';
import Movies from 'async!../routes/movies';
import Auth from 'async!../routes/auth';

import NotFound from 'async!../routes/404';

export default class App extends Component {
  /** Gets fired when the route changes.
   *  @param {Object} event    "change" event from [preact-router](http://git.io/preact-router)
   *  @param {string} event.url  The newly routed URL
   */
  handleRoute = e => {
    this.setState({
      currentUrl: e.url
    });
  };

  render() {
    return (
      <div id="app">
        <Header selectedRoute={this.state.currentUrl}/>
        <Router onChange={this.handleRoute}>
          <Home path="/" />
          <Movies path="/movies/:userId" />
          <Auth path="/auth" />
          <NotFound default />
        </Router>
      </div>
    );
  }
}
